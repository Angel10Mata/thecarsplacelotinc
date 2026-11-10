import { normalizeKnownRole } from "@/components/(base)/(users)/usuarios/lib/permissions";

export function profileRequiresPasswordChange(
  ultimaActualizacionContraseña: string | null | undefined,
  role: string,
): boolean {
  if (normalizeKnownRole(role) === "super") return false;
  if (!ultimaActualizacionContraseña) return true;
  const lastChange = new Date(ultimaActualizacionContraseña);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return lastChange < threeMonthsAgo;
}
