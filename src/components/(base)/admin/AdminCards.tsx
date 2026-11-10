"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MorphIconBox } from "@/components/ui/morph-hover-icon";
import { adminMorphIcons } from "@/lib/morph-icons";
import { APP_AJUSTES_PATH } from "@/lib/app-config";

const adminOptions = [
  {
    id: "dispositivos",
    href: `${APP_AJUSTES_PATH}/dispositivos`,
    title: "Dispositivos",
    desc: "Autorizar o rechazar solicitudes de acceso por dispositivo.",
    card: "border-amber-600 bg-amber-500 dark:border-amber-500 dark:bg-amber-600",
    iconOnCard: "#ffffff",
    iconBoxOnCard:
      "bg-white/20 border-white/30 shadow-sm dark:bg-white/15 dark:border-white/25",
  },
  {
    id: "usuarios",
    href: `${APP_AJUSTES_PATH}/usuarios`,
    title: "Usuarios",
    desc: "Gestionar cuentas de usuario, roles y permisos.",
    card: "border-purple-600 bg-purple-500 dark:border-purple-500 dark:bg-purple-600",
    iconOnCard: "#ffffff",
    iconBoxOnCard:
      "bg-white/20 border-white/30 shadow-sm dark:bg-white/15 dark:border-white/25",
  },
  {
    id: "configuraciones",
    href: `${APP_AJUSTES_PATH}/configuraciones`,
    title: "Configuraciones",
    desc: "Ajustes generales del sistema y seguridad.",
    card: "border-red-700 bg-red-600 dark:border-red-500 dark:bg-red-700",
    iconOnCard: "#ffffff",
    iconBoxOnCard:
      "bg-white/20 border-white/30 shadow-sm dark:bg-white/15 dark:border-white/25",
  },
] as const;

// Tarjeta
function AdminCard({
  opt,
  pendingDevices,
}: {
  opt: (typeof adminOptions)[number];
  pendingDevices: number;
}) {
  const [hovered, setHovered] = useState(false);
  const pair = adminMorphIcons[opt.id];

  return (
    <div
      id={`card-${opt.id}`}
      className={cn(
        "group relative overflow-hidden rounded-4xl md:rounded-[2.5rem] border flex shadow-md cursor-pointer transition-transform duration-200 hover:-translate-y-0.5",
        opt.card,
      )}
    >
      <Link
        href={opt.href}
        className="w-full h-full flex flex-row items-center justify-start gap-4 md:gap-6 p-4 md:p-6 outline-none relative z-10"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <MorphIconBox
          from={pair.from}
          to={pair.to}
          size={40}
          color={opt.iconOnCard}
          strokeWidth={1.75}
          spring="snappy"
          padding="md"
          hovered={hovered}
          boxClassName={opt.iconBoxOnCard}
        />

        <div className="flex flex-col space-y-0 md:space-y-1 relative z-10 flex-1">
          <h3 className="text-base md:text-xl font-bold tracking-tight text-white">
            {opt.title}
          </h3>
          <p className="text-[10px] md:text-xs text-white/85 line-clamp-1 font-medium italic">
            {opt.desc}
          </p>
        </div>

        {opt.id === "dispositivos" && pendingDevices > 0 && (
          <span className="shrink-0 flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-full bg-white text-xs font-bold text-amber-700 animate-pulse z-10">
            {pendingDevices}
          </span>
        )}
      </Link>
    </div>
  );
}

// Export
export function AdminCards({ pendingDevices }: { pendingDevices: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {adminOptions.map((opt) => (
        <AdminCard key={opt.href} opt={opt} pendingDevices={pendingDevices} />
      ))}
    </div>
  );
}
