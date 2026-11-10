import {
  MENSAJE_ERROR_CREAR_USUARIO,
  MENSAJE_ERROR_GENERAL,
  MENSAJE_ERROR_SISTEMA,
  mensajeParaUsuario,
} from "@/lib/mensajes-usuario";

export function mensajeErrorEs(mensaje: string | undefined | null): string {
  if (!mensaje?.trim()) {
    return MENSAJE_ERROR_GENERAL;
  }

  const lower = mensaje.trim().toLowerCase();

  const reglas: { match: (s: string) => boolean; es: string }[] = [
    {
      match: (s) =>
        s.includes("valid bearer token") ||
        s.includes("invalid api key") ||
        s.includes("invalid jwt"),
      es: MENSAJE_ERROR_SISTEMA,
    },
    {
      match: (s) => s.includes("user not allowed"),
      es: MENSAJE_ERROR_CREAR_USUARIO,
    },
    {
      match: (s) =>
        s.includes("already registered") ||
        s.includes("already been registered") ||
        s.includes("duplicate key") ||
        s.includes("users_email_partial_key"),
      es: "Ese nombre de usuario o correo ya está registrado. Elige otro.",
    },
    {
      match: (s) => s.includes("signup is disabled"),
      es: MENSAJE_ERROR_CREAR_USUARIO,
    },
    {
      match: (s) => s.includes("password should be at least"),
      es: "La contraseña no cumple los requisitos mínimos de seguridad.",
    },
    {
      match: (s) => s.includes("invalid email"),
      es: "Los datos del usuario no son válidos. Revisa el formulario.",
    },
    {
      match: (s) => s.includes("row-level security") || s.includes("rls"),
      es: "No tienes permiso para realizar esta acción.",
    },
    {
      match: (s) => s.includes("violates foreign key"),
      es: MENSAJE_ERROR_GENERAL,
    },
    {
      match: (s) => s.includes("network") || s.includes("fetch failed"),
      es: "Error de conexión. Intenta de nuevo.",
    },
    {
      match: (s) => s.includes("rate limit"),
      es: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
    },
  ];

  for (const regla of reglas) {
    if (regla.match(lower)) {
      return regla.es;
    }
  }

  return mensajeParaUsuario(mensaje, MENSAJE_ERROR_GENERAL);
}
