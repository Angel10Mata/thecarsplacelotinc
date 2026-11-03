"use server";

import { createClient } from "@/utils/supabase/server";
import { carRowSchema } from "@/components/(base)/vehiculos/lib/zod";
import { loadCustomersByIds } from "@/components/(base)/vehiculos/lib/load-customers";
import { mapCarRowToPublicInventoryItem } from "./helpers";
import { publicInventoryItemSchema } from "./zod";

export async function listPublicInventoryAction() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("invoice_date", { ascending: false });

    if (error) {
      console.error("listPublicInventory:", error.message);
      return { ok: false as const, code: "DB_ERROR" };
    }

    const cars = (data ?? [])
      .map((row) => carRowSchema.safeParse(row))
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

    const items = cars
      .map((car) => {
        const customer = car.customer_id
          ? (customerById.get(car.customer_id) ?? null)
          : null;
        return mapCarRowToPublicInventoryItem(car, customer);
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item) => {
        const parsedItem = publicInventoryItemSchema.safeParse(item);
        return parsedItem.success ? parsedItem.data : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return { ok: true as const, data: items };
  } catch {
    return { ok: false as const, code: "UNKNOWN" };
  }
}
