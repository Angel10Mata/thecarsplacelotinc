"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalFechaCalendario } from "@/components/ui/general-modal";
import {
  Popover,
  PopoverTrigger,
  usePopoverMountReady,
} from "@/components/ui/popover";
import {
  FiltroAnioMesPopoverContent,
  filtroAnioMesMesBotonClass,
  filtroAnioMesMesesGridClass,
  usePopoverTriggerWidth,
} from "@/components/ui/filtro-anio-mes-popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  aplicarAlcanceMesSelect,
  cambiarVistaFiltro,
  etiquetaAlcanceMesTrigger,
  etiquetaAnioPicker,
  opcionesAlcanceMesSelect,
  seleccionarAnioMesPicker,
  seleccionarMesMesPicker,
} from "./lib/helpers";
import type { ReporteriaFiltroCalendario, ReporteriaVista } from "./lib/zod";

const VISTAS: Array<{ value: ReporteriaVista; label: string }> = [
  { value: "mes", label: "Mes" },
  { value: "rango", label: "Rango" },
];

const pillButtonClass = (active: boolean) =>
  cn(
    "cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
    active
      ? "bg-brand/10 text-brand dark:bg-brand-bright/15 dark:text-brand-bright"
      : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
  );

const rangoFechaShellClass =
  "h-9 min-w-0 w-full flex-1 basis-0 lg:w-[10.75rem] lg:max-w-[10.75rem] lg:flex-none";

const rangoFechaInputClass =
  "h-9 rounded-xl border-zinc-200 bg-white pl-2 pr-10 text-xs tabular-nums tracking-tight dark:border-zinc-700 dark:bg-zinc-900 sm:pl-3 sm:pr-12 sm:text-sm lg:rounded-full";

const filtroBrandPillClass = cn(
  "h-9 w-full min-w-0 text-sm font-semibold text-brand shadow-none",
  "rounded-full border border-brand/35 bg-white px-2.5",
  "hover:border-brand/55 hover:bg-brand/5",
  "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20",
  "dark:border-brand-bright/40 dark:bg-zinc-900 dark:text-brand-bright dark:hover:bg-brand-bright/10",
  "dark:focus-visible:ring-brand-bright/25",
);

const filtroBrandPillMobileCenterClass = cn(
  "max-lg:relative max-lg:justify-center max-lg:px-8",
  "[&>svg:last-child]:max-lg:absolute [&>svg:last-child]:max-lg:right-2.5 [&>svg:last-child]:max-lg:text-brand",
  "dark:[&>svg:last-child]:max-lg:text-brand-bright",
);

type ReporteriaFiltrosProps = {
  filtro: ReporteriaFiltroCalendario;
  onFiltro: (value: ReporteriaFiltroCalendario) => void;
};

export function ReporteriaFiltros({
  filtro,
  onFiltro,
}: ReporteriaFiltrosProps) {
  return (
    <section className="flex flex-col gap-3 px-3 sm:px-4 md:px-0 lg:flex-row lg:flex-wrap lg:items-center">
      <div
        className={cn(
          "flex w-full min-w-0 flex-col gap-2.5 rounded-2xl border border-zinc-200 bg-white p-2.5 dark:border-zinc-700 dark:bg-zinc-900",
          "lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:gap-1 lg:rounded-full lg:p-1",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-1",
            "lg:inline-flex lg:w-auto",
          )}
        >
          {VISTAS.map((vista) => (
            <button
              key={vista.value}
              type="button"
              onClick={() => onFiltro(cambiarVistaFiltro(filtro, vista.value))}
              className={cn(
                pillButtonClass(filtro.vista === vista.value),
                "flex-1 text-center lg:flex-none",
              )}
            >
              {vista.label}
            </button>
          ))}
        </div>

        {filtro.vista === "rango" ? (
          <div
            className={cn(
              "grid w-full grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-1.5 border-t border-zinc-100 pt-2.5 dark:border-zinc-800",
              "lg:flex lg:w-auto lg:flex-nowrap lg:items-center lg:gap-2 lg:border-0 lg:border-l lg:border-zinc-100 lg:pt-0 lg:pl-2.5 lg:pr-1 dark:lg:border-zinc-800",
            )}
          >
            <span className="shrink-0 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              Del
            </span>
            <ModalFechaCalendario
              value={filtro.rangoInicio}
              onChange={(rangoInicio) =>
                onFiltro({ ...filtro, rangoInicio: rangoInicio || filtro.rangoInicio })
              }
              className={rangoFechaShellClass}
              inputClassName={rangoFechaInputClass}
            />
            <span className="shrink-0 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              al
            </span>
            <ModalFechaCalendario
              value={filtro.rangoFin}
              onChange={(rangoFin) =>
                onFiltro({ ...filtro, rangoFin: rangoFin || filtro.rangoFin })
              }
              className={rangoFechaShellClass}
              inputClassName={rangoFechaInputClass}
            />
          </div>
        ) : null}

        {filtro.vista === "mes" ? (
          <div
            className={cn(
              "grid w-full grid-cols-1 items-center gap-2 border-t border-zinc-100 pt-2.5 dark:border-zinc-800",
              "sm:grid-cols-[auto_1fr]",
              "lg:flex lg:w-auto lg:flex-nowrap lg:border-0 lg:border-l lg:border-zinc-100 lg:pt-0 lg:pl-2 lg:pr-1 dark:lg:border-zinc-800",
            )}
          >
            <AnioPicker filtro={filtro} onFiltro={onFiltro} />
            {filtro.alcance !== "year" ? (
              <AlcanceMesSelect filtro={filtro} onFiltro={onFiltro} />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

function filtroBrandPillTriggerClass(extra?: string) {
  return cn(
    filtroBrandPillClass,
    "inline-flex shrink-0 cursor-pointer items-center gap-1.5",
    filtroBrandPillMobileCenterClass,
    "lg:w-auto lg:min-w-[9.5rem] lg:justify-between lg:px-4",
    extra,
  );
}

function AnioPicker({
  filtro,
  onFiltro,
}: {
  filtro: ReporteriaFiltroCalendario;
  onFiltro: (value: ReporteriaFiltroCalendario) => void;
}) {
  const mes = filtro.mes;
  const [open, setOpen] = useState(false);
  const popoverReady = usePopoverMountReady();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const etiquetaTrigger = etiquetaAnioPicker(mes);
  const triggerWidth = usePopoverTriggerWidth(triggerRef, etiquetaTrigger);
  const selectedYear = Number(mes.slice(0, 4));
  const selectedMonth = Number(mes.slice(5, 7));
  const [draftYear, setDraftYear] = useState(selectedYear);

  useEffect(() => {
    if (open) setDraftYear(selectedYear);
  }, [open, selectedYear]);

  const irAnio = (year: number) => {
    setDraftYear(year);
    onFiltro(seleccionarAnioMesPicker(filtro, year));
  };

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      className={filtroBrandPillTriggerClass("lg:min-w-[6.5rem]")}
      aria-label="Elegir año y mes"
    >
      <span className="flex-1 whitespace-nowrap text-center text-brand tabular-nums max-lg:text-center lg:text-left dark:text-brand-bright">
        {etiquetaTrigger}
      </span>
      <ChevronDown
        className="size-4 shrink-0 text-brand opacity-70 dark:text-brand-bright"
        aria-hidden
      />
    </button>
  );

  if (!popoverReady) {
    return triggerButton;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <FiltroAnioMesPopoverContent triggerWidth={triggerWidth}>
        <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
          <NavChevron
            label="Año anterior"
            onClick={() => irAnio(draftYear - 1)}
          />
          <button
            type="button"
            onClick={() => {
              irAnio(draftYear);
              setOpen(false);
            }}
            className="min-w-[4rem] cursor-pointer rounded-xl px-2 py-1 text-center text-base font-black tabular-nums text-zinc-800 transition-colors hover:bg-brand/10 hover:text-brand dark:text-zinc-100 dark:hover:bg-brand-bright/15 dark:hover:text-brand-bright"
            aria-label={`Ver todo el año ${draftYear}`}
          >
            {draftYear}
          </button>
          <NavChevron
            label="Año siguiente"
            onClick={() => irAnio(draftYear + 1)}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            irAnio(draftYear);
            setOpen(false);
          }}
          className={cn(
            "mb-2 h-9 w-full cursor-pointer rounded-full text-sm font-bold transition-colors",
            filtro.alcance === "year" && selectedYear === draftYear
              ? "bg-brand text-white dark:bg-brand-bright dark:text-zinc-950"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
          )}
        >
          Todos
        </button>
        <div className={filtroAnioMesMesesGridClass}>
          {MESES_CORTOS.map((label, index) => {
            const monthValue = `${draftYear}-${String(index + 1).padStart(2, "0")}`;
            const active =
              filtro.alcance !== "year" &&
              draftYear === selectedYear &&
              index + 1 === selectedMonth;
            return (
              <button
                key={monthValue}
                type="button"
                onClick={() => {
                  onFiltro(seleccionarMesMesPicker(filtro, monthValue));
                  setOpen(false);
                }}
                className={cn(
                  filtroAnioMesMesBotonClass,
                  active
                    ? "bg-brand text-white dark:bg-brand-bright dark:text-zinc-950"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </FiltroAnioMesPopoverContent>
    </Popover>
  );
}

const semanaSelectContentClass = cn(
  "z-[200] overflow-hidden rounded-2xl border p-0 opacity-100 shadow-[0_16px_48px_rgba(15,23,42,0.12)]",
  "border-zinc-200 bg-white text-zinc-900",
  "dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100",
  "min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)]",
);

const semanaSelectItemClass = cn(
  "relative cursor-pointer py-3 pl-4 pr-10 text-sm font-semibold outline-none select-none",
  "text-zinc-800 dark:text-zinc-100",
  "focus:bg-zinc-100 focus:text-zinc-900",
  "data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900",
  "dark:focus:bg-zinc-800 dark:focus:text-zinc-50",
  "dark:data-[highlighted]:bg-zinc-800 dark:data-[highlighted]:text-zinc-50",
  "data-[state=checked]:bg-brand/12 data-[state=checked]:text-brand",
  "data-[state=checked]:data-[highlighted]:bg-brand/20 data-[state=checked]:data-[highlighted]:text-brand",
  "dark:data-[state=checked]:bg-brand/35 dark:data-[state=checked]:text-white",
  "dark:data-[state=checked]:data-[highlighted]:bg-brand/45 dark:data-[state=checked]:data-[highlighted]:text-white",
  "[&_[data-slot=select-item-indicator]_svg]:text-brand dark:[&_[data-slot=select-item-indicator]_svg]:text-white",
);

function AlcanceMesSelect({
  filtro,
  onFiltro,
}: {
  filtro: ReporteriaFiltroCalendario;
  onFiltro: (value: ReporteriaFiltroCalendario) => void;
}) {
  const opciones = opcionesAlcanceMesSelect(filtro.mes);
  const value =
    filtro.alcance === "week" ? String(filtro.semana) : "month";

  return (
    <Select
      value={value}
      onValueChange={(raw) => {
        if (raw === "month") {
          onFiltro({ ...filtro, alcance: "month", semana: 1 });
          return;
        }
        onFiltro(aplicarAlcanceMesSelect(filtro, raw));
      }}
    >
      <SelectTrigger
        className={cn(
          filtroBrandPillClass,
          "cursor-pointer",
          filtroBrandPillMobileCenterClass,
          "[&_svg:not([class*='size-'])]:text-brand dark:[&_svg:not([class*='size-'])]:text-brand-bright",
          "max-lg:[&_[data-slot=select-value]]:flex-1 max-lg:[&_[data-slot=select-value]]:justify-center max-lg:[&_[data-slot=select-value]]:text-center max-lg:[&_[data-slot=select-value]]:text-brand dark:max-lg:[&_[data-slot=select-value]]:text-brand-bright",
          "[&_[data-slot=select-value]]:truncate lg:min-w-[11.5rem] lg:max-w-none lg:justify-between lg:px-3 lg:[&_[data-slot=select-value]]:flex-none lg:[&_[data-slot=select-value]]:text-left lg:[&_[data-slot=select-value]]:text-brand dark:lg:[&_[data-slot=select-value]]:text-brand-bright",
        )}
      >
        <SelectValue placeholder="Semana">
          {etiquetaAlcanceMesTrigger(filtro)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={8}
        align="start"
        className={semanaSelectContentClass}
      >
        <SelectItem
          value="month"
          disabled
          className="pointer-events-none absolute h-0 overflow-hidden border-0 p-0 opacity-0"
        >
          Mes
        </SelectItem>
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto p-1.5">
          {opciones.map((opcion) => (
            <SelectItem
              key={String(opcion.value)}
              value={String(opcion.value)}
              className={cn(semanaSelectItemClass, "rounded-xl")}
            >
              {opcion.label}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

function NavChevron({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const Icon =
    label === "Anterior" || label === "Año anterior" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
