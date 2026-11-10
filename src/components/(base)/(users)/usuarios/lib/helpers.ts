import { normalizeKnownRole } from "./permissions";

export function extractRolesFromProfiles(
  users: { rol: string | null }[] | undefined,
): string[] {
  if (!users) return [];
  return Array.from(
    new Set(
      users
        .map((u) => (u.rol ? normalizeKnownRole(u.rol) : null))
        .filter((rol): rol is string => Boolean(rol)),
    ),
  );
}

export function resolveKnownRole(
  roleOptions: string[],
  preferred?: string | null,
): string {
  const canonical = preferred ? normalizeKnownRole(preferred) : null;
  if (canonical && roleOptions.includes(canonical)) return canonical;
  return roleOptions[0] ?? "user";
}
