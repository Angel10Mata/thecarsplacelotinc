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

export const DEFAULT_SIGNUP_ROLE = "user" as const;

export function resolveKnownRole(
  roleOptions: string[],
  preferred?: string | null,
): string {
  const canonical = preferred
    ? normalizeKnownRole(preferred)
    : DEFAULT_SIGNUP_ROLE;
  if (canonical && roleOptions.includes(canonical)) return canonical;
  if (roleOptions.includes(DEFAULT_SIGNUP_ROLE)) return DEFAULT_SIGNUP_ROLE;
  return roleOptions[0] ?? DEFAULT_SIGNUP_ROLE;
}
