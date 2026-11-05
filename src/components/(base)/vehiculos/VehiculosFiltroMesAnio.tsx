"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  etiquetaFiltroMesAnioVehiculos,
  seleccionarAnioFiltroVehiculos,
  seleccionarMesFiltroVehiculos,
  seleccionarTodosFiltroVehiculos,
  type VehiculosFiltroMesAnio,
} from "./lib/filtro-mes-anio";
import { vehiculosTablaAddOutlineButtonClass } from "./lib/tabla-vehiculos-ui";

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

type VehiculosFiltroMesAnioProps = {
  filtro: VehiculosFiltroMesAnio;
  onFiltro: (value: VehiculosFiltroMesAnio) => void;
  className?: string;
};

export function VehiculosFiltroMesAnioControls({
  filtro,
  onFiltro,
  className,
}: VehiculosFiltroMesAnioProps) {
  return (
    <div className={cn("shrink-0", className)}>
      <AnioPickerVehiculos filtro={filtro} onFiltro={onFiltro} />
    </div>
  );
}

function AnioPickerVehiculos({
  filtro,
  onFiltro,
}: {
  filtro: VehiculosFiltroMesAnio;
  onFiltro: (value: VehiculosFiltroMesAnio) => void;
}) {
  const mes = filtro.mes;
  const [open, setOpen] = useState(false);
  const popoverReady = usePopoverMountReady();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const etiquetaTrigger = etiquetaFiltroMesAnioVehiculos(filtro);
  const triggerWidth = usePopoverTriggerWidth(triggerRef, etiquetaTrigger);
  const selectedYear = Number(mes.slice(0, 4));
  const selectedMonth = Number(mes.slice(5, 7));
  const [draftYear, setDraftYear] = useState(selectedYear);

  useEffect(() => {
    if (open) setDraftYear(selectedYear);
  }, [open, selectedYear]);

  const irAnio = (year: number) => {
    setDraftYear(year);
    onFiltro(seleccionarAnioFiltroVehiculos(filtro, year));
  };

  const triggerClassName = cn(
    vehiculosTablaAddOutlineButtonClass,
    "min-w-[6.25rem] tabular-nums md:min-w-[9.5rem] md:justify-between md:px-4",
  );

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      className={triggerClassName}
      aria-label="Elegir año y mes"
    >
      {etiquetaTrigger}
      <ChevronDown className="size-4 shrink-0 opacity-80" aria-hidden />
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
          <NavChevron label="Año anterior" onClick={() => irAnio(draftYear - 1)} />
          <button
            type="button"
            onClick={() => {
              onFiltro(seleccionarTodosFiltroVehiculos(filtro));
              setOpen(false);
            }}
            className={cn(
              "min-w-[4rem] cursor-pointer rounded-xl px-2 py-1 text-center text-base font-black tabular-nums text-zinc-800 transition-colors hover:bg-brand/10 hover:text-brand dark:text-zinc-100 dark:hover:bg-brand-bright/15 dark:hover:text-brand-bright",
              filtro.alcance === "all" &&
                "bg-brand/10 text-brand dark:bg-brand-bright/15 dark:text-brand-bright",
            )}
            aria-label="Ver todos los registros"
          >
            {draftYear}
          </button>
          <NavChevron label="Año siguiente" onClick={() => irAnio(draftYear + 1)} />
        </div>
        <div className={filtroAnioMesMesesGridClass}>
          {MESES_CORTOS.map((label, index) => {
            const monthValue = `${draftYear}-${String(index + 1).padStart(2, "0")}`;
            const active =
              filtro.alcance === "month" &&
              draftYear === selectedYear &&
              index + 1 === selectedMonth;
            return (
              <button
                key={monthValue}
                type="button"
                onClick={() => {
                  onFiltro(seleccionarMesFiltroVehiculos(filtro, monthValue));
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

function NavChevron({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const Icon = label === "Año anterior" ? ChevronLeft : ChevronRight;
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
