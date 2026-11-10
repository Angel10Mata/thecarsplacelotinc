import { z } from "zod";

// Registro
export const INITIAL_USER_PASSWORD = "Acceso" as const;

export const authSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  username: z
    .string()
    .trim()
    .min(1, "El usuario es obligatorio")
    .min(3, "Mínimo 3 caracteres")
    .toLowerCase()
    .regex(
      /^[a-z0-9]+$/,
      "Solo letras minúsculas y números (sin espacios ni símbolos)",
    ),
  password: z.literal(INITIAL_USER_PASSWORD, {
    message: "La clave inicial debe ser Acceso.",
  }),
  rol: z.string().min(1, "El rol es obligatorio").trim(),
});

export type AuthInput = z.infer<typeof authSchema>;
