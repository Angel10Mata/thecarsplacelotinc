"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import {
  SigetTablaPageSizeSelect,
  type SigetTablaPageSizeValue,
} from "@/components/ui/siget-tabla-page-size-select";
import { cn } from "@/lib/utils";
import type { VehiculoListRow } from "@/components/(base)/vehiculos/lib/zod";
import {
  vehiculosTablaAccentBarClass,
  vehiculosTablaAccentTextClass,
  vehiculosTablaCardShellClass,
  vehiculosTablaPaginationBarClass,
  vehiculosTablaPaginationControlClass,
  vehiculosTablaMobileCardsWrapClass,
} from "@/components/(base)/vehiculos/lib/tabla-vehiculos-ui";
import { VehiculosTablaMobileCards } from "@/components/(base)/vehiculos/VehiculosTablaMobileCards";
import {
  VehiculosTablaDesktop,
  VehiculoTablaFilaMenu,
} from "@/components/(base)/vehiculos/VehiculosTablaDesktop";

type PageSize = SigetTablaPageSizeValue;

type ClienteDetalleVehiculosTablaProps = {
  rows: VehiculoListRow[];
  isLoading: boolean;
  isError: boolean;
  onVerGaleria: (row: VehiculoListRow) => void;
  onVerFactura: (row: VehiculoListRow) => void;
  onEditar: (row: VehiculoListRow) => void;
};

export function ClienteDetalleVehiculosTabla({
  rows,
  isLoading,
  isError,
  onVerGaleria,
  onVerFactura,
  onEditar,
}: ClienteDetalleVehiculosTablaProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(15);

  const showAll = pageSize === "all";
  const totalPages = showAll ? 1 : Math.max(1, Math.ceil(rows.length / pageSize));
  const pageSafe = showAll ? 1 : Math.min(page, totalPages);
  const rowOffset = showAll ? 0 : (pageSafe - 1) * pageSize;
  const sliceSize = showAll ? rows.length : pageSize;
  const pageItems = useMemo(
    () => rows.slice(rowOffset, rowOffset + sliceSize),
    [rows, rowOffset, sliceSize],
  );

  const emptyMessage = "Sin vehículos asignados a este cliente.";

  return (
    <div className={cn("flex w-full min-w-0 flex-col shrink-0", vehiculosTablaCardShellClass)}>
      <div className={vehiculosTablaAccentBarClass} aria-hidden />
      <div className="flex min-h-0 flex-1 flex-col bg-card dark:bg-zinc-900/40">
        {isLoading ? <ModuleDataLoadingPanel /> : null}

        {!isLoading && isError ? (
          <p className="px-4 py-14 text-center text-sm font-semibold text-destructive">
            No se pudo cargar los vehículos de este cliente.
          </p>
        ) : null}

        {!isLoading && !isError ? (
          <>
            <VehiculosTablaDesktop
              pageItems={pageItems}
              emptyMessage={emptyMessage}
              onVerGaleria={onVerGaleria}
              onVerFactura={onVerFactura}
              onEditar={onEditar}
            />

            <div className={vehiculosTablaMobileCardsWrapClass}>
              {pageItems.length === 0 ? (
                <p className="px-4 py-14 text-center text-base font-semibold text-muted-foreground">
                  {emptyMessage}
                </p>
              ) : (
                <VehiculosTablaMobileCards
                  items={pageItems}
                  onVerGaleria={onVerGaleria}
                  onVerFactura={onVerFactura}
                  renderAcciones={(row) => (
                    <VehiculoTablaFilaMenu
                      row={row}
                      onEditar={() => onEditar(row)}
                    />
                  )}
                />
              )}
            </div>
          </>
        ) : null}

        {!isLoading && !isError && rows.length > 0 ? (
          <div className={vehiculosTablaPaginationBarClass}>
            <SigetTablaPageSizeSelect
              value={pageSize}
              onChange={(next) => {
                setPageSize(next);
                setPage(1);
              }}
            />
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe <= 1}
              className={vehiculosTablaPaginationControlClass}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span
              className={cn(
                "min-w-[3.5rem] text-center text-base font-bold tabular-nums",
                vehiculosTablaAccentTextClass,
              )}
            >
              {pageSafe}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages}
              className={vehiculosTablaPaginationControlClass}
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
