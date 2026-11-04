import { VEHICULOS_MODULE_PATH } from "@/lib/app-config";

export const VEHICULO_VER_SESSION_KEY = "tcpl.vehiculo-ver-factura";

export function vehiculosModuloPath(): string {
  return VEHICULOS_MODULE_PATH;
}

export function guardarVehiculoVerEnSesion(invoiceNumber: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(VEHICULO_VER_SESSION_KEY, invoiceNumber.trim());
}

export function consumirVehiculoVerEnSesion(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const value = sessionStorage.getItem(VEHICULO_VER_SESSION_KEY)?.trim();
  if (!value) return null;
  sessionStorage.removeItem(VEHICULO_VER_SESSION_KEY);
  return value;
}

export function vehiculoVerEnModuloPath(invoiceNumber: string): string {
  guardarVehiculoVerEnSesion(invoiceNumber);
  return vehiculosModuloPath();
}

export function limpiarVerVehiculoEnUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("ver")) return;
  url.searchParams.delete("ver");
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

export function leerVerVehiculoEnUrl(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("ver")?.trim();
  return value || null;
}
