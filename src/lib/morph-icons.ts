import type { IconNode } from "lucide";
import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  CarFront,
  ChartColumnIncreasing,
  ChevronRight,
  ChevronsRight,
  CircleDollarSign,
  CreditCard,
  ExternalLink,
  FileChartColumnIncreasing,
  Fingerprint,
  FolderKanban,
  Home,
  House,
  EllipsisVertical,
  LayoutGrid,
  LogIn,
  LogOut,
  Minimize2,
  Package,
  PackageCheck,
  PanelRightOpen,
  RefreshCw,
  RotateCw,
  Settings,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  TabletSmartphone,
  Truck,
  Undo2,
  Warehouse,
  User,
  UserRoundPlus,
  Users,
  Wallet,
  X,
} from "lucide";

// TIPOS

export type MorphIconPair = {
  from: IconNode;
  to: IconNode;
};

export type MorphIconColorSet = {
  color: string;
  boxClass: string;
};

// COLORES POR MÓDULO

export const moduleIconColors: Record<string, MorphIconColorSet> = {
  ventas: {
    color: "#EC4899",
    boxClass:
      "bg-pink-50 dark:bg-pink-950/45 border-pink-200/90 dark:border-pink-800/55",
  },
  clientes: {
    color: "#2563EB",
    boxClass:
      "bg-blue-50 dark:bg-blue-950/45 border-blue-200/90 dark:border-blue-800/55",
  },
  proveedores: {
    color: "#D97706",
    boxClass:
      "bg-amber-50 dark:bg-amber-950/45 border-amber-200/90 dark:border-amber-800/55",
  },
  finanzas: {
    color: "#059669",
    boxClass:
      "bg-emerald-50 dark:bg-emerald-950/45 border-emerald-200/90 dark:border-emerald-800/55",
  },
  inventario: {
    color: "#0891B2",
    boxClass:
      "bg-cyan-50 dark:bg-cyan-950/45 border-cyan-200/90 dark:border-cyan-800/55",
  },
  creditos: {
    color: "#6366F1",
    boxClass:
      "bg-indigo-50 dark:bg-indigo-950/45 border-indigo-200/90 dark:border-indigo-800/55",
  },
  vehiculos: {
    color: "#dc2626",
    boxClass:
      "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/30 border-red-200/90 dark:border-red-800/55 shadow-md ring-1 ring-red-500/10 dark:ring-red-400/10",
  },
  reporteria: {
    color: "#71717a",
    boxClass:
      "bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900/80 dark:to-zinc-800/40 border-zinc-300/90 dark:border-zinc-600/55 shadow-md ring-1 ring-zinc-400/10 dark:ring-zinc-500/10",
  },
};

// COLORES ADMIN

export const adminIconColors: Record<string, MorphIconColorSet> = {
  dispositivos: {
    color: "#F59E0B",
    boxClass:
      "bg-amber-50 dark:bg-amber-950/45 border-amber-200/90 dark:border-amber-700/55 shadow-sm",
  },
  usuarios: {
    color: "#A855F7",
    boxClass:
      "bg-purple-50 dark:bg-purple-950/45 border-purple-200/90 dark:border-purple-700/55 shadow-sm",
  },
  configuraciones: {
    color: "#dc2626",
    boxClass:
      "bg-red-50 dark:bg-red-950/45 border-red-200/90 dark:border-red-800/55 shadow-sm",
  },
};

// COLORES NAVEGACIÓN

export const navIconColors = {
  brand: "#dc2626",
  brandBright: "#ef4444",
  brandRed: "#dc2626",
  brandRedBright: "#ef4444",
  success: "#2E9E77",
  warning: "#C28A38",
  danger: "#CC5C5C",
} as const;

export const navIconBoxClass = {
  menuTile:
    "border-zinc-200/90 bg-zinc-100 shadow-none dark:border-zinc-600/55 dark:bg-zinc-800",
  menuTileSub:
    "border-zinc-200/80 bg-zinc-100/95 shadow-none dark:border-zinc-600/50 dark:bg-zinc-800/90",
} as const;

// ICONOS MORPH MÓDULOS

export const moduleMorphIcons: Record<string, MorphIconPair> = {
  inventario: { from: Package, to: Box },
  proveedores: { from: Truck, to: PackageCheck },
  ventas: { from: ShoppingCart, to: ShoppingBag },
  clientes: { from: Users, to: UserRoundPlus },
  finanzas: { from: Wallet, to: CircleDollarSign },
  creditos: { from: CreditCard, to: Wallet },
  vehiculos: { from: Warehouse, to: CarFront },
  reporteria: { from: FileChartColumnIncreasing, to: ChartColumnIncreasing },
};

// ICONOS MORPH ADMIN

export const adminMorphIcons: Record<string, MorphIconPair> = {
  dispositivos: { from: Smartphone, to: TabletSmartphone },
  usuarios: { from: Users, to: UserRoundPlus },
  configuraciones: { from: Settings, to: SlidersHorizontal },
};

// ICONOS MORPH NAVEGACIÓN

export const navMorphIcons = {
  arrowUpRight: { from: ArrowUpRight, to: ExternalLink },
  arrowLeft: { from: ArrowLeft, to: Undo2 },
  home: { from: Home, to: House },
  chevronRight: { from: ChevronRight, to: ChevronsRight },
  menu: { from: EllipsisVertical, to: PanelRightOpen },
  close: { from: X, to: Minimize2 },
  refresh: { from: RefreshCw, to: RotateCw },
  fallback: { from: FolderKanban, to: LayoutGrid },
  settings: { from: Settings, to: SlidersHorizontal },
  user: { from: User, to: UserRoundPlus },
  fingerprint: { from: Fingerprint, to: ShieldAlert },
  logIn: { from: LogIn, to: ArrowUpRight },
  logOut: { from: LogOut, to: ArrowLeft },
} satisfies Record<string, MorphIconPair>;
