"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { cn } from "@/lib/utils";
import { modulePageHeaderClass, modulePageHeaderStackClass, modulePageShellClass, modulePageTitleClass } from "@/lib/module-layout";
import { GraficasDineroVehiculos } from "./GraficasDineroVehiculos";
import { GraficasIngresosVehiculos } from "./GraficasIngresosVehiculos";
import { ReporteriaFiltros } from "./ReporteriaFiltros";
import {
  buildDineroPorMes,
  buildIngresosVehiculosSerie,
  filasEnPeriodo,
  filtroCalendarioInicial,
  resolverRangoCalendario,
  resumenDineroVehiculos,
  resumenIngresosVehiculos,
} from "./lib/helpers";
import { useReporteriaVehiculos } from "./lib/hooks";
import type { ReporteriaCampoFecha, ReporteriaFiltroCalendario } from "./lib/zod";

export function VerReporteria() {
  const [mounted, setMounted] = useState(false);
  const [filtro, setFiltro] = useState<ReporteriaFiltroCalendario | null>(null);
  const [campo] = useState<ReporteriaCampoFecha>("factura");
  const { data = [], isPending, isError } = useReporteriaVehiculos();

  useEffect(() => {
    setFiltro(filtroCalendarioInicial());
    setMounted(true);
  }, []);

  const rangoGrafica = useMemo(
    () => (mounted && filtro ? resolverRangoCalendario(filtro) : null),
    [filtro, mounted],
  );

  const filasGrafica = useMemo(
    () =>
      mounted && rangoGrafica
        ? filasEnPeriodo(data, campo, rangoGrafica.inicio, rangoGrafica.fin)
        : [],
    [campo, data, mounted, rangoGrafica],
  );

  const ingresos = useMemo(() => {
    if (!rangoGrafica) {
      return {
        puntos: [],
        vehiculos: 0,
        ultimoFechaLabel: "—",
      };
    }
    const puntos = buildIngresosVehiculosSerie(
      filasGrafica,
      campo,
      rangoGrafica.inicio,
      rangoGrafica.fin,
    );
    return { puntos, ...resumenIngresosVehiculos(puntos) };
  }, [campo, filasGrafica, rangoGrafica]);

  const dinero = useMemo(() => {
    if (!rangoGrafica) {
      return {
        puntos: [],
        vendido: 0,
        lote: 0,
        unidadesVendidas: 0,
        unidadesLote: 0,
      };
    }
    return {
      puntos: buildDineroPorMes(
        filasGrafica,
        campo,
        rangoGrafica.inicio,
        rangoGrafica.fin,
      ),
      ...resumenDineroVehiculos(filasGrafica),
    };
  }, [campo, filasGrafica, rangoGrafica]);

  return (
    <div
      className={cn(
        modulePageShellClass,
        "min-h-0 gap-2 pt-0 pb-0 md:pt-0 md:pb-8 mt-0 md:mt-4",
      )}
    >
      <header className={modulePageHeaderClass}>
        <div className={modulePageHeaderStackClass}>
          <ModuleHeaderBackButton />
          <h1 className={modulePageTitleClass}>Reportería</h1>
        </div>
      </header>

      {!mounted || isPending ? (
        <ModuleDataLoadingPanel minHeightClass="min-h-[22rem]" />
      ) : null}

      {mounted && !isPending && isError ? (
        <p className="rounded-2xl border border-border py-14 text-center text-sm font-semibold text-destructive dark:border-zinc-700">
          No se pudieron cargar los indicadores.
        </p>
      ) : null}

      {mounted && filtro && !isPending && !isError ? (
        <div className="flex flex-col gap-6">
          <ReporteriaFiltros filtro={filtro} onFiltro={setFiltro} />

          <GraficasIngresosVehiculos
            puntos={ingresos.puntos}
            registrados={ingresos.vehiculos}
          />

          <GraficasDineroVehiculos
            puntos={dinero.puntos}
            vendido={dinero.vendido}
          />
        </div>
      ) : null}
    </div>
  );
}
