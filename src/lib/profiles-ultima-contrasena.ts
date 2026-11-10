export const COL_ULTIMA_ACTUALIZACION_CONTRASENA =
  "ultima_actualizacion_contraseña";

export function readUltimaActualizacionContraseña(
  row: Record<string, unknown> | null | undefined,
): string | null | undefined {
  if (!row) return undefined;
  const value = row[COL_ULTIMA_ACTUALIZACION_CONTRASENA];
  if (value === null) return null;
  if (value === undefined) return undefined;
  return typeof value === "string" ? value : undefined;
}

export function patchUltimaActualizacionContraseña(
  value: string | null,
): Record<string, string | null> {
  return { [COL_ULTIMA_ACTUALIZACION_CONTRASENA]: value };
}
