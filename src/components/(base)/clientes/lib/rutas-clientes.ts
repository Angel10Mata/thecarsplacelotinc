import { APP_BASE_PATH } from "@/lib/app-config";

export const CLIENTE_DETALLE_SESSION_KEY = "tcpl.cliente-detalle-id";

export function clienteDetallePath(): string {
  return `${APP_BASE_PATH}/cliente/detalles`;
}

export function guardarClienteDetalleEnSesion(customerId: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(CLIENTE_DETALLE_SESSION_KEY, customerId);
}

export function leerClienteDetalleEnSesion(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const value = sessionStorage.getItem(CLIENTE_DETALLE_SESSION_KEY);
  return value?.trim() ? value : null;
}
