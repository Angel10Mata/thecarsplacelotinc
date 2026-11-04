import { APP_BASE_PATH, PUBLIC_CATALOG_PATH } from "@/lib/app-config";

export function getModuleBackHref(pathname: string): string | null {
  if (pathname === APP_BASE_PATH || pathname === `${APP_BASE_PATH}/`) {
    return null;
  }

  if (!pathname.startsWith(`${APP_BASE_PATH}/`)) {
    return null;
  }

  const rawSegments = pathname.split("/").filter((item) => item !== "");
  if (rawSegments.length <= 1) {
    return null;
  }

  let backHref = APP_BASE_PATH;
  const moduleName = rawSegments.length > 1 ? rawSegments[1] : "";

  if (
    rawSegments[1] === "cliente" &&
    rawSegments.includes("detalles")
  ) {
    return `${APP_BASE_PATH}/clientes`;
  }

  if (rawSegments.includes("editar")) {
    const detalleIdx = rawSegments.indexOf("ver");
    const id =
      detalleIdx >= 0 && detalleIdx + 1 < rawSegments.length
        ? rawSegments[detalleIdx + 1]
        : "";
    backHref = id
      ? `${APP_BASE_PATH}/${moduleName}/ver/${id}`
      : `${APP_BASE_PATH}/${moduleName}`;
  } else if (rawSegments.includes("ver")) {
    backHref = `${APP_BASE_PATH}/${moduleName}`;
  } else if (rawSegments.length > 1) {
    backHref = `/${rawSegments.slice(0, -1).join("/")}`;
  }

  return backHref;
}

function normalizeHref(href: string): string {
  if (href === PUBLIC_CATALOG_PATH) return PUBLIC_CATALOG_PATH;
  return href.replace(/\/$/, "") || "/";
}

export function getModuleBackLabel(pathname: string, backHref: string): string {
  const normalized = normalizeHref(backHref);

  if (normalized === APP_BASE_PATH) {
    return "Volver al panel";
  }

  if (normalized === PUBLIC_CATALOG_PATH) {
    return "Volver al inventario";
  }

  const byHref: Record<string, string> = {
    [`${APP_BASE_PATH}/vehiculos`]: "Volver a vehículos",
    [`${APP_BASE_PATH}/clientes`]: "Volver a clientes",
    [`${APP_BASE_PATH}/reporteria`]: "Volver a reportería",
    [`${APP_BASE_PATH}/admin`]: "Volver a administración",
    [`${APP_BASE_PATH}/usuarios`]: "Volver a usuarios",
    [`${APP_BASE_PATH}/configuraciones`]: "Volver a configuraciones",
    [`${APP_BASE_PATH}/devices`]: "Volver a dispositivos",
  };

  if (byHref[normalized]) {
    return byHref[normalized];
  }

  if (/\/ver\/[^/]+$/.test(normalized)) {
    if (pathname.includes("/cliente/")) {
      return "Volver al cliente";
    }
    return "Volver al detalle";
  }

  const segment = normalized.split("/").pop() ?? "";
  return segment ? `Volver a ${segment}` : "Volver";
}
