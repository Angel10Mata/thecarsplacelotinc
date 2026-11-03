import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { mensajeSiServiceRoleKeyInvalida } from "@/lib/supabase-service-role-env";
import {
  customerRowSchema,
  type CustomerRow,
} from "@/components/(base)/clientes/lib/zod";

const CUSTOMER_COLUMNS =
  "id, customer_name, customer_nit, customer_address, created_at";

function ingestCustomerRows(
  rows: unknown[] | null,
  into: Map<string, CustomerRow>,
) {
  for (const row of rows ?? []) {
    const parsed = customerRowSchema.safeParse(row);
    if (parsed.success) into.set(parsed.data.id, parsed.data);
  }
}

export async function loadCustomersByIds(
  ids: string[],
): Promise<Map<string, CustomerRow>> {
  const customerById = new Map<string, CustomerRow>();
  const uniqueIds = [...new Set(ids.filter((id) => id.length > 0))];
  if (uniqueIds.length === 0) return customerById;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(CUSTOMER_COLUMNS)
    .in("id", uniqueIds);

  if (error) {
    console.error("loadCustomersByIds:", error.message);
  } else {
    ingestCustomerRows(data, customerById);
  }

  const missing = uniqueIds.filter((id) => !customerById.has(id));
  if (missing.length === 0) return customerById;
  if (mensajeSiServiceRoleKeyInvalida()) return customerById;

  try {
    const admin = createAdminClient();
    const adminRes = await admin
      .from("customers")
      .select(CUSTOMER_COLUMNS)
      .in("id", missing);
    if (adminRes.error) {
      console.error("loadCustomersByIds admin:", adminRes.error.message);
    } else {
      ingestCustomerRows(adminRes.data, customerById);
    }
  } catch (err) {
    console.error("loadCustomersByIds admin:", err);
  }

  return customerById;
}
