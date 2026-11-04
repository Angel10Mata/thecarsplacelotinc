import { z } from "zod";

export const customerRowSchema = z.object({
  id: z.string().uuid(),
  customer_name: z.string(),
  customer_nit: z.string().nullable(),
  customer_address: z.string().nullable(),
  created_at: z.string(),
});

export type CustomerRow = z.infer<typeof customerRowSchema>;

export const crearCustomerSchema = z.object({
  customer_name: z.string().trim().min(1, "Nombre del cliente requerido"),
  customer_nit: z.string().trim().optional(),
  customer_address: z.string().trim().optional(),
});

export type CrearCustomerInput = z.infer<typeof crearCustomerSchema>;

export const actualizarCustomerSchema = crearCustomerSchema.extend({
  id: z.string().uuid(),
});

export type ActualizarCustomerInput = z.infer<typeof actualizarCustomerSchema>;

export type ClienteListRow = {
  id: string;
  nombre: string;
  nit: string | null;
  direccion: string | null;
  created_at: string;
  vehiculosCount: number;
};

export const customerRefSchema = z
  .object({
    nit: z.string().trim().min(1).optional(),
    nombre: z.string().trim().min(1).optional(),
  })
  .refine((value) => Boolean(value.nit?.length || value.nombre?.length), {
    message: "Referencia de cliente requerida",
  });

export type CustomerRef = z.infer<typeof customerRefSchema>;

export type ClienteVehiculoItem = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  vin: string | null;
  estado: string | null;
};
