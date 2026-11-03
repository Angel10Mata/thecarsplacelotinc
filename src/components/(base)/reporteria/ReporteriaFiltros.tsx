"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalFechaCalendario } from "@/components/ui/general-modal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  cambiarVistaFiltro,
  etiquetaMesLargo,
  etiquetaRangoSemanaCorto,
  opcionesSemanaMes,
  rangoSemanaMes,
} from "./lib/helpers";
import type {
  ReporteriaFiltroCalendario,
  ReporteriaSemana,
  ReporteriaVista,
} from "./lib/zod";

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
  "h-9 rounded-xl border-zinc-200 bg-zinc-50 pl-2 pr-10 text-xs tabular-nums tracking-tight dark:border-zinc-700 dark:bg-zinc-800 sm:pl-3 sm:pr-12 sm:text-sm lg:rounded-full";

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
              "grid w-full grid-cols-1 items-center gap-2 border-t border-zinc-100 pt-2.5 dark:border-zinc-800 sm:grid-cols-2",
              "lg:flex lg:w-auto lg:flex-nowrap lg:border-0 lg:border-l lg:border-zinc-100 lg:pt-0 lg:pl-2 lg:pr-1 dark:lg:border-zinc-800",
            )}
          >
            <MesPicker
              mes={filtro.mes}
              onMes={(mes) =>
                onFiltro({ ...filtro, mes, semana: "all", dia: `${mes}-01` })
              }
            />
            <SemanaMesSelect
              filtro={filtro}
              onSemana={(semana) => onFiltro({ ...filtro, semana })}
            />
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

function MesPicker({
  mes,
  onMes,
}: {
  mes: string;
  onMes: (mes: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>();
  const selectedYear = Number(mes.slice(0, 4));
  const selectedMonth = Number(mes.slice(5, 7));
  const [draftYear, setDraftYear] = useState(selectedYear);

  useEffect(() => {
    if (open) setDraftYear(selectedYear);
  }, [open, selectedYear]);

  useLayoutEffect(() => {
    if (!open) return;
    const syncWidth = () => {
      const width = triggerRef.current?.getBoundingClientRect().width;
      if (width && width > 0) setPanelWidth(Math.round(width));
    };
    syncWidth();
    const node = triggerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(syncWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open]);

  const etiqueta = etiquetaMesLargo(mes);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={cn(
            "inline-flex h-9 w-full shrink-0 cursor-pointer items-center justify-between gap-1.5 rounded-full border border-brand/35 bg-white px-2.5 text-sm font-semibold text-brand shadow-none",
            "hover:border-brand/55 hover:bg-brand/5",
            "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20",
            "dark:border-brand-bright/40 dark:bg-zinc-900 dark:text-brand-bright dark:hover:bg-brand-bright/10",
            "dark:focus-visible:ring-brand-bright/25",
            "lg:w-auto lg:min-w-[13.75rem] lg:px-3",
          )}
          aria-label="Elegir mes"
        >
          <CalendarDays className="size-4 shrink-0 max-sm:hidden" aria-hidden />
          <span className="flex-1 whitespace-nowrap text-center sm:text-left">
            {etiqueta}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        style={panelWidth != null ? { width: panelWidth } : undefined}
        className={cn(
          "z-[200] w-auto max-w-none rounded-2xl border border-zinc-100 bg-white p-2 opacity-100 shadow-[0_16px_48px_rgba(15,23,42,0.12)]",
          "dark:border-zinc-700 dark:bg-zinc-900",
        )}
      >
        <div className="mb-2 flex items-center justify-between px-0.5">
          <NavChevron
            label="Año anterior"
            onClick={() => setDraftYear((year) => year - 1)}
          />
          <span className="min-w-[2.75rem] text-center text-xs font-bold tabular-nums text-zinc-800 dark:text-zinc-100 sm:text-sm">
            {draftYear}
          </span>
          <NavChevron
            label="Año siguiente"
            onClick={() => setDraftYear((year) => year + 1)}
          />
        </div>
        <div className="grid grid-cols-3 gap-0.5">
          {MESES_CORTOS.map((label, index) => {
            const monthValue = `${draftYear}-${String(index + 1).padStart(2, "0")}`;
            const active = draftYear === selectedYear && index + 1 === selectedMonth;
            return (
              <button
                key={monthValue}
                type="button"
                onClick={() => {
                  onMes(monthValue);
                  setOpen(false);
                }}
                className={cn(
                  "h-8 cursor-pointer rounded-full text-[11px] font-semibold leading-none transition-colors sm:text-xs",
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
      </PopoverContent>
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

const semanaSelectItemTodoClass = cn(
  semanaSelectItemClass,
  "rounded-none py-3.5 text-[15px] font-bold",
  "data-[state=checked]:bg-brand/15 dark:data-[state=checked]:bg-brand/40",
);

function SemanaMesSelect({
  filtro,
  onSemana,
}: {
  filtro: ReporteriaFiltroCalendario;
  onSemana: (semana: ReporteriaSemana) => void;
}) {
  const semanas = opcionesSemanaMes(filtro.mes);
  const [opcionTodo, ...opcionesSemana] = semanas;
  const value = String(filtro.semana);

  return (
    <Select
      value={value}
      onValueChange={(raw) => {
        const semana: ReporteriaSemana = raw === "all" ? "all" : Number(raw);
        onSemana(semana);
      }}
    >
      <SelectTrigger
        className={cn(
          "h-9 w-full min-w-0 cursor-pointer rounded-full border border-brand/35 bg-white px-2.5 text-sm font-semibold text-brand shadow-none",
          "hover:border-brand/55 hover:bg-brand/5",
          "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20",
          "dark:border-brand-bright/40 dark:bg-zinc-900 dark:text-brand-bright dark:hover:bg-brand-bright/10",
          "dark:focus-visible:ring-brand-bright/25 [&_svg:not([class*='size-'])]:text-brand dark:[&_svg:not([class*='size-'])]:text-brand-bright",
          "[&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-center lg:min-w-[11.5rem] lg:max-w-none lg:px-3 lg:[&_[data-slot=select-value]]:text-left",
        )}
      >
        <SelectValue placeholder="Semana">
          {etiquetaSemanaTrigger(filtro.semana, filtro.mes)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={8}
        align="start"
        className={semanaSelectContentClass}
      >
        {opcionTodo ? (
          <SelectItem value={String(opcionTodo.value)} className={semanaSelectItemTodoClass}>
            {opcionTodo.label}
          </SelectItem>
        ) : null}
        <SelectSeparator className="my-0 bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto p-1.5">
          {opcionesSemana.map((opcion) => (
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

function etiquetaSemanaTrigger(semana: ReporteriaSemana, mes: string): string {
  if (semana === "all") return "Todo el mes";
  const { inicio, fin } = rangoSemanaMes(mes, semana);
  return etiquetaRangoSemanaCorto(inicio, fin);
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
