"use server";

import { revalidatePath } from "next/cache";
import { APP_BASE_PATH } from "@/lib/app-config";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { carRowSchema } from "@/components/(base)/vehiculos/lib/zod";
import {
  buildNumeroRegistroPorId,
  mapCarToListRow,
  sortVehiculosRecientesPrimero,
} from "@/components/(base)/vehiculos/lib/helpers";
import { mapCustomerToListRow } from "./helpers";
import {
  actualizarCustomerSchema,
  crearCustomerSchema,
  customerRefSchema,
  customerRowSchema,
  type ClienteListRow,
  type CustomerRow,
} from "./zod";

const customerIdParamSchema = z.string().uuid();

function revalidateCustomerPaths() {
  revalidatePath(`${APP_BASE_PATH}/clientes`);
  revalidatePath(`${APP_BASE_PATH}/vehiculos`);
}

export async function listCustomersAction(search?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const term = search?.trim() ?? "";
    if (term.length > 0 && term.length < 3) {
      return { ok: true as const, data: [] as ClienteListRow[] };
    }

    let query = supabase
      .from("customers")
      .select("*")
      .order("customer_name", { ascending: true })
      .limit(term.length >= 3 ? 25 : 500);

    if (term.length >= 3) {
      const pattern = `%${term.replace(/[%_,]/g, "")}%`;
      query = query.or(
        `customer_name.ilike.${pattern},customer_nit.ilike.${pattern}`,
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("listCustomers:", error.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const parsed = (data ?? [])
      .map((row) => customerRowSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data);

    const { data: carLinks, error: carsError } = await supabase
      .from("cars")
      .select("customer_id");

    if (carsError) {
      console.error("listCustomers counts:", carsError.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const vehiculosPorCliente = new Map<string, number>();
    for (const link of carLinks ?? []) {
      const customerId = link.customer_id;
      if (typeof customerId !== "string") continue;
      vehiculosPorCliente.set(
        customerId,
        (vehiculosPorCliente.get(customerId) ?? 0) + 1,
      );
    }

    const list = parsed.map((row) =>
      mapCustomerToListRow(row, vehiculosPorCliente.get(row.id) ?? 0),
    );

    return { ok: true as const, data: list };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}

export async function crearCustomerAction(raw: unknown) {
  const parsed = crearCustomerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const payload = {
      customer_name: parsed.data.customer_name,
      customer_nit: parsed.data.customer_nit?.trim() || null,
      customer_address: parsed.data.customer_address?.trim() || null,
    };

    const { data, error } = await supabase
      .from("customers")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("crearCustomer:", error.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const row = customerRowSchema.safeParse(data);
    if (!row.success) {
      return { ok: false as const, code: "DB_ERROR" };
    }

    revalidateCustomerPaths();
    return { ok: true as const, data: row.data };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}

export async function actualizarCustomerAction(raw: unknown) {
  const parsed = actualizarCustomerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const payload = {
      customer_name: parsed.data.customer_name,
      customer_nit: parsed.data.customer_nit?.trim() || null,
      customer_address: parsed.data.customer_address?.trim() || null,
    };

    const { data, error } = await supabase
      .from("customers")
      .update(payload)
      .eq("id", parsed.data.id)
      .select("*")
      .single();

    if (error) {
      console.error("actualizarCustomer:", error.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const row = customerRowSchema.safeParse(data);
    if (!row.success) {
      return { ok: false as const, code: "DB_ERROR" };
    }

    revalidateCustomerPaths();
    return { ok: true as const, data: row.data };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}

export async function getCustomerByRefAction(rawRef: unknown) {
  const parsedRef = customerRefSchema.safeParse(rawRef);
  if (!parsedRef.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    let query = supabase.from("customers").select("*");
    const nit = parsedRef.data.nit?.trim();
    const nombre = parsedRef.data.nombre?.trim();
    if (nit) {
      query = query.eq("customer_nit", nit);
    }
    if (nombre) {
      query = query.ilike("customer_name", nombre);
    }

    const { data, error } = await query;
    if (error) {
      console.error("getCustomerByRef:", error.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const rows = (data ?? [])
      .map((row) => customerRowSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data);

    if (rows.length === 0) {
      return { ok: false as const, code: "NOT_FOUND" };
    }
    if (rows.length > 1) {
      return { ok: false as const, code: "AMBIGUOUS" };
    }

    const customer = rows[0]!;

    const { count, error: countError } = await supabase
      .from("cars")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customer.id);

    if (countError) {
      console.error("getCustomerByRef count:", countError.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    return {
      ok: true as const,
      data: mapCustomerToListRow(customer, count ?? 0),
    };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}

export async function getCustomerByIdAction(rawCustomerId: unknown) {
  const parsedId = customerIdParamSchema.safeParse(rawCustomerId);
  if (!parsedId.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (error) {
      console.error("getCustomerById:", error.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    if (!data) {
      return { ok: false as const, code: "NOT_FOUND" };
    }

    const row = customerRowSchema.safeParse(data);
    if (!row.success) {
      return { ok: false as const, code: "DB_ERROR" };
    }

    const { count, error: countError } = await supabase
      .from("cars")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", parsedId.data);

    if (countError) {
      console.error("getCustomerById count:", countError.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    return {
      ok: true as const,
      data: mapCustomerToListRow(row.data, count ?? 0),
    };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}

export async function listCarsByCustomerAction(rawCustomerId: unknown) {
  const parsedId = customerIdParamSchema.safeParse(rawCustomerId);
  if (!parsedId.success) {
    return { ok: false as const, code: "VALIDATION" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, code: "UNAUTHORIZED" };

    const { data: customerRaw, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (customerError) {
      console.error("listCarsByCustomer customer:", customerError.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const customerParsed = customerRaw
      ? customerRowSchema.safeParse(customerRaw)
      : null;
    const customer: CustomerRow | null = customerParsed?.success
      ? customerParsed.data
      : null;

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("customer_id", parsedId.data)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("listCarsByCustomer:", error.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const { data: registroMeta, error: registroError } = await supabase
      .from("cars")
      .select("id, created_at");

    if (registroError) {
      console.error("listCarsByCustomer registro:", registroError.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const numeroPorId = buildNumeroRegistroPorId(
      (registroMeta ?? [])
        .filter(
          (row): row is { id: string; created_at: string } =>
            typeof row.id === "string" && typeof row.created_at === "string",
        )
        .map((row) => ({ id: row.id, createdAt: row.created_at })),
    );

    const items = (data ?? [])
      .map((row) => carRowSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => {
        const mapped = mapCarToListRow(r.data, customer);
        return {
          ...mapped,
          numeroRegistro: numeroPorId.get(mapped.id) ?? 0,
        };
      });

    return { ok: true as const, data: sortVehiculosRecientesPrimero(items) };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}
