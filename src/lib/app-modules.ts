import { APP_BASE_PATH } from "@/lib/app-config";

export interface AppModuleConfig {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  href: string;
  allowedRoles?: string[];
  requiresAdmin?: boolean;
}

export const APP_MODULES: AppModuleConfig[] = [
  {
    id: "vehiculos",
    title: "Vehículos",
    subtitle: "Inventario",
    desc: "Inventario de vehículos, estatus en lote, documentación y ubicación.",
    href: `${APP_BASE_PATH}/vehiculos`,
    allowedRoles: ["super", "admin", "user"],
  },
  {
    id: "clientes",
    title: "Clientes",
    subtitle: "Directorio",
    desc: "Directorio de clientes, NIT, dirección y datos de contacto.",
    href: `${APP_BASE_PATH}/clientes`,
    allowedRoles: ["super", "admin", "user"],
  },
  {
    id: "reporteria",
    title: "Reportería",
    subtitle: "Compras",
    desc: "Compras de vehículos, montos y métricas por periodo.",
    href: `${APP_BASE_PATH}/reporteria`,
    allowedRoles: ["super", "admin", "user"],
  },
];

export const ADMIN_MENU_ITEMS = [
  {
    id: "dispositivos",
    href: `${APP_BASE_PATH}/admin/dispositivos`,
    title: "Dispositivos",
    desc: "Autorizar o rechazar solicitudes de acceso por dispositivo.",
  },
  {
    id: "usuarios",
    href: `${APP_BASE_PATH}/admin/usuarios`,
    title: "Usuarios",
    desc: "Gestionar cuentas de usuario, roles y permisos.",
  },
  {
    id: "configuraciones",
    href: `${APP_BASE_PATH}/admin/configuraciones`,
    title: "Configuraciones",
    desc: "Ajustes generales del sistema y seguridad.",
  },
] as const;
