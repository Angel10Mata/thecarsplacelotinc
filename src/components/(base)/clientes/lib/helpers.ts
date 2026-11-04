import type { CarRow } from "@/components/(base)/vehiculos/lib/zod";
import type { ClienteListRow, ClienteVehiculoItem, CustomerRow } from "./zod";

export function mapCustomerToListRow(
  row: CustomerRow,
  vehiculosCount = 0,
): ClienteListRow {
  return {
    id: row.id,
    nombre: row.customer_name,
    nit: row.customer_nit?.trim() || null,
    direccion: row.customer_address?.trim() || null,
    created_at: row.created_at,
    vehiculosCount,
  };
}

export function customerRowFromClienteListRow(row: ClienteListRow): CustomerRow {
  return {
    id: row.id,
    customer_name: row.nombre,
    customer_nit: row.nit,
    customer_address: row.direccion,
    created_at: row.created_at,
  };
}

export function mapCarRowToClienteVehiculoItem(row: CarRow): ClienteVehiculoItem {
  return {
    id: row.id,
    placa: row.invoice_number,
    marca: row.car_title,
    modelo: row.car_model?.trim() || "—",
    vin: row.car_vin?.trim() || null,
    estado: row.car_status?.trim() || null,
  };
}
