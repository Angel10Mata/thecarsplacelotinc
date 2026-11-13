"use server";

import { revalidatePath } from "next/cache";
import { APP_BASE_PATH, PUBLIC_CATALOG_PATH, VEHICULOS_INVENTARIO_PATH } from "@/lib/app-config";
import { createClient } from "@/utils/supabase/server";
import { resolveUserRole } from "@/lib/user-role";
import { canEditClientesYVehiculos } from "@/components/(base)/(users)/usuarios/lib/permissions";
import { DEFAULT_CAR_INCOTERMS, DEFAULT_CAR_STATUS } from "./helpers";
import { loadCustomersByIds } from "./load-customers";
import { codeFromPgUniqueViolation } from "./action-errors";
import {
  actualizarCarSchema,
  carRowSchema,
  crearCarSchema,
} from "./zod";

function resolveRegisteredBy(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata ?? {};
  const nombre = meta.nombre ?? meta.full_name ?? meta.username;
  if (typeof nombre === "string" && nombre.trim()) return nombre.trim();
  return user.email?.split("@")[0] ?? "Usuario";
}

type CarsSupabase = Awaited<ReturnType<typeof createClient>>;

async function facturaDuplicadaEnBase(
  supabase: CarsSupabase,
  invoiceNumber: string,
  excludeCarId?: string | null,
): Promise<
  | { ok: true; exists: boolean; detail: string }
  | { ok: false; code: "DB_ERROR" }
> {
  const numero = invoiceNumber.trim();
  if (!numero) {
    return { ok: true, exists: false, detail: numero };
  }

  let query = supabase
    .from("cars")
    .select("id")
    .ilike("invoice_number", numero)
    .limit(1);

  if (excludeCarId?.trim()) {
    query = query.neq("id", excludeCarId.trim());
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("facturaDuplicadaEnBase:", error.message);
    return { ok: false, code: "DB_ERROR" };
  }

  return {
    ok: true,
    exists: Boolean(data),
    detail: numero,
  };
}

export async function verificarFacturaDuplicadaAction(
  invoiceNumber: string,
  excludeCarId?: string | null,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" as const };

    const dup = await facturaDuplicadaEnBase(
      supabase,
      invoiceNumber,
      excludeCarId,
    );
    if (!dup.ok) {
      return { ok: false as const, code: dup.code };
    }

    return {
      ok: true as const,
      exists: dup.exists,
      detail: dup.detail,
    };
  } catch {
    return { ok: false as const, code: "UNKNOWN" as const };
  }
}

export async function listCarsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("listCars:", error.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const cars = (data ?? [])
      .map((row) => {
        const parsedRow = carRowSchema.safeParse(row);
        if (!parsedRow.success) {
          const id =
            typeof row === "object" &&
            row !== null &&
            "id" in row &&
            typeof row.id === "string"
              ? row.id
              : "?";
          console.warn("listCars: fila omitida (formato inválido)", id);
        }
        return parsedRow;
      })
      .filter((r) => r.success)
      .map((r) => r.data);

    const customerIds = [
      ...new Set(
        cars
          .map((c) => c.customer_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    ];

    const customerById = await loadCustomersByIds(customerIds);

    const parsed = cars.map((car) => ({
      car,
      customer: car.customer_id
        ? (customerById.get(car.customer_id) ?? null)
        : null,
    }));

    return { ok: true as const, data: parsed };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}

export async function crearCarAction(raw: unknown) {
  const parsed = crearCarSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const carImages = (parsed.data.car_image_urls ?? [])
      .map((url) => url.trim())
      .filter(Boolean);

    const dup = await facturaDuplicadaEnBase(
      supabase,
      parsed.data.invoice_number,
    );
    if (!dup.ok) {
      return { ok: false as const, code: "DB_ERROR" };
    }
    if (dup.exists) {
      return {
        ok: false as const,
        code: "DUPLICATE_INVOICE" as const,
        detail: dup.detail,
      };
    }

    const payload = {
      invoice_number: parsed.data.invoice_number.trim(),
      invoice_date: `${parsed.data.invoice_date}T12:00:00.000Z`,
      has_signed_receipt: parsed.data.has_signed_receipt,
      customer_id: parsed.data.customer_id ?? null,
      car_id:
        parsed.data.car_id?.trim() ||
        null,
      car_title: parsed.data.car_title,
      car_status:
        parsed.data.car_status?.trim() || DEFAULT_CAR_STATUS,
      car_model: parsed.data.car_model?.trim() || null,
      car_vin: parsed.data.car_vin?.trim() || null,
      car_price: parsed.data.car_price ?? null,
      car_images: carImages,
      sub_total: parsed.data.sub_total,
      total: parsed.data.total,
      terms: parsed.data.terms,
      incoterms: parsed.data.incoterms?.trim() || DEFAULT_CAR_INCOTERMS,
      registered_by: resolveRegisteredBy(user),
    };

    const { error } = await supabase.from("cars").insert(payload);
    if (error) {
      console.error("crearCar:", error.message, error.details);
      if (error.code === "23505") {
        const dup = codeFromPgUniqueViolation(error);
        return {
          ok: false as const,
          code: dup.code,
          detail: dup.detail ?? null,
        };
      }
      return { ok: false as const, code: "DB_ERROR" };
    }

    revalidatePath(`${APP_BASE_PATH}/vehiculos`);
    revalidatePath(VEHICULOS_INVENTARIO_PATH);
    revalidatePath(PUBLIC_CATALOG_PATH);
    return { ok: true as const };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}

export async function getCarForEditAction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      console.error("getCarForEdit:", error?.message);
      return { ok: false as const, code: "NOT_FOUND" };
    }

    const parsedCar = carRowSchema.safeParse(data);
    if (!parsedCar.success) {
      return { ok: false as const, code: "VALIDATION" };
    }

    const customerId = parsedCar.data.customer_id;
    const customers = customerId
      ? await loadCustomersByIds([customerId])
      : new Map();
    const customer = customerId
      ? (customers.get(customerId) ?? null)
      : null;

    return {
      ok: true as const,
      data: { car: parsedCar.data, customer },
    };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}

export async function actualizarCarAction(raw: unknown) {
  const parsed = actualizarCarSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const role = await resolveUserRole(supabase, user);
    if (!canEditClientesYVehiculos(role)) {
      return { ok: false as const, code: "FORBIDDEN" as const };
    }

    const carImages = (parsed.data.car_image_urls ?? [])
      .map((url) => url.trim())
      .filter(Boolean);

    const dup = await facturaDuplicadaEnBase(
      supabase,
      parsed.data.invoice_number,
      parsed.data.id,
    );
    if (!dup.ok) {
      return { ok: false as const, code: "DB_ERROR" };
    }
    if (dup.exists) {
      return {
        ok: false as const,
        code: "DUPLICATE_INVOICE" as const,
        detail: dup.detail,
      };
    }

    const payload = {
      invoice_number: parsed.data.invoice_number.trim(),
      invoice_date: `${parsed.data.invoice_date}T12:00:00.000Z`,
      has_signed_receipt: parsed.data.has_signed_receipt,
      customer_id: parsed.data.customer_id ?? null,
      car_id: parsed.data.car_id?.trim() || null,
      car_title: parsed.data.car_title,
      car_status: parsed.data.car_status?.trim() || DEFAULT_CAR_STATUS,
      car_model: parsed.data.car_model?.trim() || null,
      car_vin: parsed.data.car_vin?.trim() || null,
      car_price: parsed.data.car_price ?? null,
      car_images: carImages,
      sub_total: parsed.data.sub_total,
      total: parsed.data.total,
      terms: parsed.data.terms,
      incoterms: parsed.data.incoterms?.trim() || DEFAULT_CAR_INCOTERMS,
    };

    const { error } = await supabase
      .from("cars")
      .update(payload)
      .eq("id", parsed.data.id);

    if (error) {
      console.error("actualizarCar:", error.message, error.details);
      if (error.code === "23505") {
        const dup = codeFromPgUniqueViolation(error);
        return {
          ok: false as const,
          code: dup.code,
          detail: dup.detail ?? null,
        };
      }
      return { ok: false as const, code: "DB_ERROR" };
    }

    revalidatePath(`${APP_BASE_PATH}/vehiculos`);
    revalidatePath(VEHICULOS_INVENTARIO_PATH);
    revalidatePath(PUBLIC_CATALOG_PATH);
    return { ok: true as const };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}
