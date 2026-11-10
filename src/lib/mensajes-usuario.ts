export const MENSAJE_ERROR_GENERAL =
  "No se pudo completar la acción. Intenta de nuevo.";

export const MENSAJE_ERROR_SISTEMA =
  "Hay un problema con el sistema. Contacta al administrador.";

export const MENSAJE_ERROR_CREAR_USUARIO =
  "No se pudo crear el usuario. Intenta de nuevo o contacta al administrador.";

export const MENSAJE_ERROR_SUBIR_ARCHIVO =
  "No se pudo subir el archivo. Intenta de nuevo.";

const PATRON_TECNICO =
  /supabase_|service_role|\.env|publishable|sb_secret|sb_publishable|invalid jwt|valid bearer|bucket not found|row-level|rls\b|sql editor|storage-cars|dashboard|pnpm|vercel|jwt|api key/i;

export function mensajeParaUsuario(
  texto: string | undefined | null,
  fallback: string = MENSAJE_ERROR_GENERAL,
): string {
  const t = texto?.trim();
  if (!t) return fallback;
  if (PATRON_TECNICO.test(t)) return fallback;
  if (/^error:/i.test(t) || /^storage:/i.test(t)) return fallback;
  return t;
}
