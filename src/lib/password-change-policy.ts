import { normalizeKnownRole } from "@/components/(base)/(users)/usuarios/lib/permissions";

export function profileRequiresPasswordChange(
  ultimoCambioPassword: string | null | undefined,
  role: string,
): boolean {
  if (normalizeKnownRole(role) === "super") return false;
  if (!ultimoCambioPassword) return true;
  const lastChange = new Date(ultimoCambioPassword);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return lastChange < threeMonthsAgo;
}
