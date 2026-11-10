export function profileRequiresPasswordChange(
  ultimaActualizacionContraseña: string | null | undefined,
): boolean {
  return !ultimaActualizacionContraseña;
}
