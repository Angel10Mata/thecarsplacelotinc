"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { MorphIconBox } from "@/components/ui/morph-hover-icon";
import {
  SigetActionButton,
} from "@/components/ui/siget-action-button";
import { APP_MODULES, type AppModuleConfig } from "@/lib/app-modules";
import {
  moduleIconColors,
  moduleMorphIcons,
  navMorphIcons,
  type MorphIconColorSet,
} from "@/lib/morph-icons";
import { TCPL_AURORA_COLORS, TCPL_BRAND_RED } from "@/lib/brand-colors";
import { dashboardInnerClass, dashboardOuterClass } from "@/lib/module-layout";

const BRAND_GRADIENT = `linear-gradient(135deg, ${[...TCPL_AURORA_COLORS, TCPL_AURORA_COLORS[0]].join(", ")})`;

const BRAND_RED_PALETTE: MorphIconColorSet =
  moduleIconColors.vehiculos ?? {
    color: TCPL_BRAND_RED.primary,
    boxClass:
      "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/30 border-red-200/90 dark:border-red-800/55 shadow-md ring-1 ring-red-500/10 dark:ring-red-400/10",
  };

type ModuleTheme = {
  palette: MorphIconColorSet;
  rippleColor: string;
};

function resolveModuleTheme(_moduleId: string): ModuleTheme {
  return {
    palette: BRAND_RED_PALETTE,
    rippleColor: "rgba(255,255,255,0.35)",
  };
}

function DashboardHeader() {
  return (
    <header className="mb-5 w-full min-w-0 text-center md:mb-7 md:pl-0 md:text-left">
      <div className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap md:flex-col md:items-start md:justify-start md:gap-0 md:whitespace-normal">
        <p className="shrink-0 text-lg font-black uppercase leading-none tracking-tight text-brand dark:text-brand-bright md:text-[10px] md:font-bold md:tracking-[0.28em]">
          Panel
        </p>
        <h1 className="min-w-0 text-lg font-black uppercase leading-none tracking-tight text-foreground md:mt-1 md:text-2xl md:text-3xl">
          Administración
        </h1>
      </div>
    </header>
  );
}

function ModuleMorphIcon({
  moduleId,
  theme,
  hovered,
}: {
  moduleId: string;
  theme: ModuleTheme;
  hovered?: boolean;
}) {
  const pair = moduleMorphIcons[moduleId] ?? navMorphIcons.fallback;

  return (
    <MorphIconBox
      from={pair.from}
      to={pair.to}
      size={48}
      color={theme.palette.color}
      strokeWidth={2}
      spring="bouncy"
      padding="md"
      hovered={hovered}
      boxClassName={cn(theme.palette.boxClass, "rounded-2xl shrink-0 shadow-sm")}
    />
  );
}

function DashboardModuleCard({
  mod,
  onNavigate,
}: {
  mod: AppModuleConfig;
  onNavigate: (href: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const theme = resolveModuleTheme(mod.id);
  const enterLabel = `Entrar a ${mod.title}`;

  return (
    <article
      id={`${mod.id}-card`}
      className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-brand/45 bg-zinc-50 shadow-md ring-1 ring-brand/25 dark:border-brand-bright/50 dark:bg-zinc-800/50 dark:shadow-lg dark:ring-brand-bright/30"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        className="shrink-0 px-4 py-2.5"
        style={{ backgroundImage: BRAND_GRADIENT }}
        aria-hidden
      />

      <div className="flex flex-1 flex-col gap-5 bg-white p-6 dark:bg-zinc-900">
        <div className="flex items-start gap-4">
          <ModuleMorphIcon moduleId={mod.id} theme={theme} hovered={hovered} />

          <div className="min-w-0 pt-0.5">
            <h2 className="text-2xl font-black leading-none tracking-tight text-foreground sm:text-[1.65rem]">
              {mod.title}
            </h2>
            <p className="mt-1 text-lg font-semibold leading-tight text-muted-foreground">
              {mod.subtitle}
            </p>
          </div>
        </div>

        <p className="text-base font-medium leading-relaxed text-muted-foreground">
          {mod.desc}
        </p>

        <div className="mt-auto pt-1">
          <SigetActionButton
            label={enterLabel}
            accentColor="#ffffff"
            rippleColor={theme.rippleColor}
            morphFrom={navMorphIcons.chevronRight.from}
            morphTo={navMorphIcons.chevronRight.to}
            onClick={() => onNavigate(mod.href)}
            ariaLabel={enterLabel}
            style={{ backgroundImage: BRAND_GRADIENT }}
            className={cn(
              "h-11 w-full rounded-xl border-0 bg-transparent text-sm font-bold text-white shadow-none hover:opacity-[0.97] dark:bg-transparent",
              "[&_span_truncate]:overflow-visible [&_span_truncate]:text-clip",
            )}
          />
        </div>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleModules.map((mod) => (
              <DashboardModuleCard
                key={mod.id}
                mod={mod}
                onNavigate={(href) => router.push(href)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
