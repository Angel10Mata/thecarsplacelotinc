"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { MorphHoverIcon } from "@/components/ui/morph-hover-icon";
import { APP_MODULES, type AppModuleConfig } from "@/lib/app-modules";
import { moduleMorphIcons, navMorphIcons } from "@/lib/morph-icons";
import { dashboardInnerClass, dashboardOuterClass } from "@/lib/module-layout";

type DashboardModuleAccent = {
  card: string;
  badge: string;
  button: string;
  iconBg: string;
  iconColor: string;
  subtitle: string;
  feature: string;
};

const DASHBOARD_MODULE_ACCENTS: Record<string, DashboardModuleAccent> = {
  vehiculos: {
    card: "border-blue-300/40 ring-blue-300/20 dark:border-blue-400/20",
    badge: "bg-blue-500",
    button: "bg-blue-500 hover:bg-blue-600",
    iconBg: "bg-blue-50 dark:bg-blue-400/10",
    iconColor: "#3b82f6",
    subtitle: "text-blue-600 dark:text-blue-400",
    feature: "text-blue-500 dark:text-blue-400",
  },
  clientes: {
    card: "border-orange-300/40 ring-orange-300/20 dark:border-orange-400/20",
    badge: "bg-orange-500",
    button: "bg-orange-500 hover:bg-orange-600",
    iconBg: "bg-orange-50 dark:bg-orange-400/10",
    iconColor: "#f97316",
    subtitle: "text-orange-600 dark:text-orange-400",
    feature: "text-orange-500 dark:text-orange-400",
  },
  reporteria: {
    card: "border-purple-300/40 ring-purple-300/20 dark:border-purple-400/20",
    badge: "bg-purple-400",
    button: "bg-purple-400 hover:bg-purple-500",
    iconBg: "bg-purple-50 dark:bg-purple-400/10",
    iconColor: "#a855f7",
    subtitle: "text-purple-600 dark:text-purple-300",
    feature: "text-purple-500 dark:text-purple-400",
  },
};

function resolveDashboardAccent(moduleId: string): DashboardModuleAccent {
  return DASHBOARD_MODULE_ACCENTS[moduleId] ?? DASHBOARD_MODULE_ACCENTS.vehiculos;
}

function DashboardHeader() {
  return (
    <header className="mb-5 w-full min-w-0 text-center md:mb-7 md:pl-0 md:text-left">
      <div className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap md:flex-col md:items-start md:justify-start md:gap-0 md:whitespace-normal">
        <p className="shrink-0 text-lg font-black uppercase leading-none tracking-tight text-brand dark:text-brand-bright md:text-sm md:font-bold md:tracking-[0.28em]">
          Panel
        </p>
        <h1 className="min-w-0 text-lg font-black uppercase leading-none tracking-tight text-brand dark:text-brand-bright md:mt-1 md:text-2xl md:text-3xl">
          Administración
        </h1>
      </div>
    </header>
  );
}

function DashboardModuleCard({
  mod,
  hovered,
  onHoverChange,
  onNavigate,
}: {
  mod: AppModuleConfig;
  hovered: boolean;
  onHoverChange: (active: boolean) => void;
  onNavigate: (href: string) => void;
}) {
  const morph = moduleMorphIcons[mod.id] ?? navMorphIcons.fallback;
  const accent = resolveDashboardAccent(mod.id);

  return (
    <article
      id={`${mod.id}-card`}
      role="link"
      tabIndex={0}
      onClick={() => onNavigate(mod.href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onNavigate(mod.href);
        }
      }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      className={cn(
        "group flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border bg-white p-0 shadow-lg ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900",
        accent.card,
      )}
    >
      <div
        className={cn(
          "py-2 text-center text-[10px] font-black uppercase tracking-widest text-white",
          accent.badge,
        )}
      >
        {mod.badge}
      </div>

      <div className="flex h-full flex-col px-5 py-8">
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                accent.iconBg,
                hovered && "scale-110",
              )}
            >
              <MorphHoverIcon
                from={morph.from}
                to={morph.to}
                hovered={hovered}
                size={40}
                color={accent.iconColor}
                spring="snappy"
              />
            </div>
            <h2 className="min-w-0 text-2xl font-black leading-[1.05] text-foreground">
              {mod.title}
              <br />
              <span className={accent.subtitle}>{mod.subtitle}</span>
            </h2>
          </div>
          <p className="text-sm font-medium leading-snug text-muted-foreground">
            {mod.desc}
          </p>
        </div>

        <div
          className={cn(
            "pointer-events-none mb-8 w-full rounded-xl py-3.5 text-center text-sm font-bold text-white shadow-sm transition-opacity duration-300 group-hover:opacity-95",
            accent.button,
          )}
          aria-hidden
        >
          {mod.cta}
        </div>

        <ul className="mt-auto w-full space-y-4">
          {mod.features.map((feature) => (
            <li
              key={feature.label}
              className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
            >
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center", accent.feature)}>
                <MorphHoverIcon
                  from={feature.iconFrom}
                  to={feature.iconTo}
                  hovered={hovered}
                  size={18}
                  color={accent.iconColor}
                  spring="snappy"
                />
              </span>
              {feature.label}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function DashboardEmptyModules() {
  return (
    <div className="w-full rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center dark:border-zinc-700 dark:bg-zinc-900/50 md:p-14">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        Sin módulos de negocio
      </p>
    </div>
  );
}

export function VerDashboard() {
  const { effectiveRole } = useUserContext();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const isSuperOrAdmin = ["super", "admin"].includes(effectiveRole);
  const roleLoaded = effectiveRole !== "authenticated";

  const visibleModules = APP_MODULES.filter((mod) => {
    if (!roleLoaded) return true;
    if (mod.requiresAdmin && !isSuperOrAdmin) return false;
    if (mod.allowedRoles && !mod.allowedRoles.includes(effectiveRole))
      return false;
    return true;
  });

  return (
    <div className={dashboardOuterClass}>
      <div className={dashboardInnerClass}>
        <DashboardHeader />
        {visibleModules.length === 0 ? (
          <DashboardEmptyModules />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
          >
            {visibleModules.map((mod) => (
              <DashboardModuleCard
                key={mod.id}
                mod={mod}
                hovered={hoveredCard === mod.id}
                onHoverChange={(active) =>
                  setHoveredCard(active ? mod.id : null)
                }
                onNavigate={(href) => router.push(href)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
