import type { IconNode } from "lucide";
import {
  CarFront,
  ChartColumnIncreasing,
  CircleDollarSign,
  ClipboardList,
  FileChartColumnIncreasing,
  FileText,
  MapPin,
  Package,
  Phone,
  Receipt,
  ShoppingCart,
  User,
  UserRoundPlus,
  Users,
  Wallet,
  Warehouse,
} from "lucide";
import { APP_BASE_PATH } from "@/lib/app-config";

export type AppModuleDashboardFeature = {
  label: string;
  iconFrom: IconNode;
  iconTo: IconNode;
};

export interface AppModuleConfig {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  href: string;
  badge: string;
  cta: string;
  features: AppModuleDashboardFeature[];
  allowedRoles?: string[];
  requiresAdmin?: boolean;
}

export const APP_MODULES: AppModuleConfig[] = [
  {
    id: "vehiculos",
    title: "Vehículos",
    subtitle: "Inventario",
    desc: "Inventario de vehículos, estatus en lote, documentación y ubicación.",
    badge: "Inventario en lote",
    cta: "Entrar a Vehículos",
    href: `${APP_BASE_PATH}/vehiculos`,
    allowedRoles: ["super", "admin", "user"],
    features: [
      { label: "Inventario y estatus en lote", iconFrom: Warehouse, iconTo: CarFront },
      { label: "Documentación del vehículo", iconFrom: FileText, iconTo: ClipboardList },
      { label: "Ubicación en el lote", iconFrom: MapPin, iconTo: Warehouse },
    ],
  },
  {
    id: "clientes",
    title: "Clientes",
    subtitle: "Directorio",
    desc: "Directorio de clientes, NIT, dirección y datos de contacto.",
    badge: "Directorio comercial",
    cta: "Entrar a Clientes",
    href: `${APP_BASE_PATH}/clientes`,
    allowedRoles: ["super", "admin", "user"],
    features: [
      { label: "Datos de contacto", iconFrom: Phone, iconTo: User },
      { label: "NIT y facturación", iconFrom: Receipt, iconTo: UserRoundPlus },
      { label: "Directorio activo", iconFrom: Users, iconTo: UserRoundPlus },
    ],
  },
  {
    id: "reporteria",
    title: "Reportería",
    subtitle: "Estadística",
    desc: "Ingresos de vehículos, montos y métricas por periodo.",
    badge: "Análisis y métricas",
    cta: "Entrar a Reportería",
    href: `${APP_BASE_PATH}/reporteria`,
    allowedRoles: ["super", "admin", "user"],
    features: [
      { label: "Montos de compra", iconFrom: CircleDollarSign, iconTo: Wallet },
      {
        label: "Métricas por periodo",
        iconFrom: FileChartColumnIncreasing,
        iconTo: ChartColumnIncreasing,
      },
      { label: "Compras registradas", iconFrom: ShoppingCart, iconTo: Package },
    ],
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
