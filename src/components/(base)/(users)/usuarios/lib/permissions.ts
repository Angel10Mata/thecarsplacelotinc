// Roles
export const ROLE_LABELS: Record<string, string> = {
  user: "Usuario (Estándar)",
  admin: "Administrador",
  super: "Sistemas",
};

export const ROLE_ORDER = ["super", "admin", "user"] as const;

const KNOWN_ROLES = [...ROLE_ORDER];
const KNOWN_ROLE_SET = new Set<string>(KNOWN_ROLES);

const CREATOR_ROLES = new Set<string>(["super", "admin"]);

export function normalizeKnownRole(role: string | null | undefined): string {
  if (!role?.trim()) return "user";
  const trimmed = role.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "administrador" || lower === "admin") return "admin";
  if (lower === "sistemas" || lower === "super") return "super";
  if (lower === "usuario" || lower === "user") return "user";
  return trimmed;
}

export function labelRol(role: string): string {
  const key = normalizeKnownRole(role);
  return ROLE_LABELS[key] ?? ROLE_LABELS[role] ?? role;
}

// Permisos
export function getManageableRoles(
  actorRole: string,
  customRoles: string[] = [],
): string[] {
  const actor = normalizeKnownRole(actorRole);
  if (actor === "super") {
    const extras = Array.from(
      new Set(
        customRoles
          .map((r) => normalizeKnownRole(r))
          .filter((r) => !KNOWN_ROLE_SET.has(r)),
      ),
    );
    return orderRoles([...KNOWN_ROLES, ...extras]);
  }
  if (actor === "admin") {
    return orderRoles(KNOWN_ROLES.filter((r) => r !== "super"));
  }
  return [];
}

export function isKnownRole(role: string): boolean {
  return KNOWN_ROLE_SET.has(role);
}

export function canManageUsers(actorRole: string): boolean {
  return getManageableRoles(actorRole).length > 0;
}

export function canCreateUsers(actorRole: string): boolean {
  return CREATOR_ROLES.has(normalizeKnownRole(actorRole));
}

export function canDeleteUser(
  actorRole: string,
  targetRole: string | null | undefined,
  isSelf: boolean,
): boolean {
  if (isSelf) return false;
  if (normalizeKnownRole(actorRole) !== "super") return false;
  return normalizeKnownRole(targetRole) !== "super";
}

export function canAssignRole(actorRole: string, targetRole: string): boolean {
  const actor = normalizeKnownRole(actorRole);
  const target = normalizeKnownRole(targetRole);
  if (actor === "super") return true;
  return getManageableRoles(actor).includes(target);
}

export function isUserVisibleToActor(
  targetRole: string | null | undefined,
  actorRole: string,
): boolean {
  const actor = normalizeKnownRole(actorRole);
  if (actor === "super") return true;
  const role = normalizeKnownRole(targetRole);
  return getManageableRoles(actor).includes(role);
}

export function orderRoles(roles: string[]): string[] {
  const uniqueRoles = Array.from(new Set(roles));
  return uniqueRoles.sort((a, b) => {
    const indexA = ROLE_ORDER.indexOf(a as (typeof ROLE_ORDER)[number]);
    const indexB = ROLE_ORDER.indexOf(b as (typeof ROLE_ORDER)[number]);
    const keyA = indexA >= 0 ? indexA : ROLE_ORDER.length;
    const keyB = indexB >= 0 ? indexB : ROLE_ORDER.length;
    if (keyA !== keyB) return keyA - keyB;
    return a.localeCompare(b, "es", { sensitivity: "base" });
  });
}
