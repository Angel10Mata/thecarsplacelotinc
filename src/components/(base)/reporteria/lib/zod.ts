import { z } from "zod";

const moneySchema = z
  .union([z.number(), z.string()])
  .nullable()
  .transform((value) => {
    if (value === null || value === "") return null;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  });

export const reporteriaVehiculoRowSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  invoice_date: z.string(),
  invoice_number: z.string(),
  car_title: z.string(),
  car_model: z.string().nullable(),
  car_status: z.string().nullable(),
  car_price: moneySchema,
  total: z.union([z.number(), z.string()]).transform((value) => Number(value)),
  customer_id: z.string().uuid().nullable(),
  clienteNombre: z.string().nullable(),
  clienteNit: z.string().nullable(),
});

export type ReporteriaVehiculoRow = z.infer<typeof reporteriaVehiculoRowSchema>;

export const ingresoVehiculoMarcaSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  factura: z.string(),
  monto: z.number(),
});

export type IngresoVehiculoMarca = z.infer<typeof ingresoVehiculoMarcaSchema>;

export const ingresoVehiculoPuntoSchema = z.object({
  fecha: z.string(),
  label: z.string(),
  ingresos: z.number().int().min(0),
  vehiculos: z.array(ingresoVehiculoMarcaSchema),
});

export type IngresoVehiculoPunto = z.infer<typeof ingresoVehiculoPuntoSchema>;

export const dineroVehiculoLineaSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  factura: z.string(),
  monto: z.number(),
});

export type DineroVehiculoLinea = z.infer<typeof dineroVehiculoLineaSchema>;

export const dineroMesPuntoSchema = z.object({
  mes: z.string(),
  label: z.string(),
  vendido: z.number(),
  lote: z.number(),
  vehiculos: z.array(dineroVehiculoLineaSchema),
});

export type DineroMesPunto = z.infer<typeof dineroMesPuntoSchema>;

export const rankingClienteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  nit: z.string().nullable(),
  unidades: z.number().int().min(0),
  monto: z.number(),
});

export type RankingCliente = z.infer<typeof rankingClienteSchema>;

export type ReporteriaPeriodo = 7 | 30 | 90 | "all";
export type ReporteriaCampoFecha = "factura" | "registro";
export type ReporteriaVista = "dia" | "mes" | "rango";
export type ReporteriaAlcanceMes = "year" | "month" | "week";

export type ReporteriaFiltroCalendario = {
  vista: ReporteriaVista;
  dia: string;
  mes: string;
  alcance: ReporteriaAlcanceMes;
  semana: number;
  rangoInicio: string;
  rangoFin: string;
};
