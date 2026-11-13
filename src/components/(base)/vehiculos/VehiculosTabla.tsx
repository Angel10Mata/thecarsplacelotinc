"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { cn } from "@/lib/utils";
import {
  consumirVehiculoVerEnSesion,
  leerVerVehiculoEnUrl,
  limpiarVerVehiculoEnUrl,
} from "@/components/(base)/vehiculos/lib/rutas-vehiculos";
import {
  marcarVehiculosGaleriaEntradaResuelta,
  vehiculosGaleriaEntradaYaResuelta,
} from "@/components/(base)/vehiculos/lib/vehiculos-galeria-entrada";
import {
  SigetTablaPageSizeSelect,
  type SigetTablaPageSizeValue,
} from "@/components/ui/siget-tabla-page-size-select";
import {
  vehiculosTablaAccentBarClass,
  vehiculosTablaAccentTextClass,
  vehiculosTablaAddOutlineButtonClass,
  vehiculosTablaCardShellClass,
  vehiculosTablaPaginationBarClass,
  vehiculosTablaPaginationControlClass,
  vehiculosTablaSearchInputClass,
  vehiculosTablaToolbarButtonsClass,
  vehiculosTablaToolbarButtonsMobileGridClass,
  vehiculosTablaToolbarFiltersClass,
  vehiculosTablaToolbarGridClass,
  vehiculosTablaToolbarSectionClass,
  vehiculosTablaMobileCardsWrapClass,
} from "./lib/tabla-vehiculos-ui";
import { VehiculosTablaMobileCards } from "./VehiculosTablaMobileCards";
import {
  VehiculosTablaDesktop,
  VehiculoTablaFilaMenu,
} from "./VehiculosTablaDesktop";
import { VehiculosFiltroMesAnioControls } from "./VehiculosFiltroMesAnio";
import CrearVehiculoModal from "./forms/Crear";
import EditarVehiculoModal from "./forms/Editar";
import {
  VehiculoGaleriaViewerModal,
  type VehiculoGaleriaView,
} from "./forms/VehiculoGaleriaViewerModal";
import { useCars } from "./lib/hooks";
import { sortVehiculosRecientesPrimero } from "./lib/helpers";
import {
  filtroMesAnioPorDefecto,
  vehiculoCoincideFiltroMesAnio,
  type VehiculosFiltroMesAnio,
} from "./lib/filtro-mes-anio";
import type { VehiculoListRow } from "./lib/zod";
import { rowHasUploadedPdf } from "./lib/vehiculo-galeria-items";
import { prefetchInvoicePdfLibs } from "./lib/vehiculo-react-pdf";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { canManageClientesYVehiculos } from "@/components/(base)/(users)/usuarios/lib/permissions";

type PageSize = SigetTablaPageSizeValue;

export function VehiculosTabla() {
  const { effectiveRole } = useUserContext();
  const puedeGestionar = canManageClientesYVehiculos(effectiveRole);
  const { data: vehiculos, isLoading, isError } = useCars();
  const [crearOpen, setCrearOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(15);
  const [galeriaRow, setGaleriaRow] = useState<VehiculoListRow | null>(null);
  const [galeriaView, setGaleriaView] = useState<VehiculoGaleriaView>("photos");
  const [editarCarId, setEditarCarId] = useState<string | null>(null);
  const [filtroMesAnio, setFiltroMesAnio] = useState<VehiculosFiltroMesAnio>(
    filtroMesAnioPorDefecto,
  );
  const abrirGaleria = (
    row: VehiculoListRow,
    view: VehiculoGaleriaView = "photos",
  ) => {
    setGaleriaView(view);
    setGaleriaRow(row);
    if (view === "invoice") {
      prefetchInvoicePdfLibs();
      if (!rowHasUploadedPdf(row)) {
        void import("./lib/vehiculo-invoice-pdf-client").then((mod) => {
          mod.prefetchGeneratedInvoicePdf(row);
        });
      }
    }
  };

  useEffect(() => {
    prefetchInvoicePdfLibs();
  }, []);

  useEffect(() => {
    if (vehiculosGaleriaEntradaYaResuelta()) return;
    if (isLoading || vehiculos == null) return;

    marcarVehiculosGaleriaEntradaResuelta();

    const legacyVer = leerVerVehiculoEnUrl();
    if (legacyVer) {
      limpiarVerVehiculoEnUrl();
    }

    const ref = legacyVer ?? consumirVehiculoVerEnSesion();
    if (!ref) return;

    const row = vehiculos.find(
      (item) => item.placa === ref || item.id === ref,
    );
    if (!row) return;

    setGaleriaRow(row);
  }, [isLoading, vehiculos]);

  const cerrarGaleria = () => {
    setGaleriaRow(null);
    limpiarVerVehiculoEnUrl();
  };

  const filtered = useMemo(() => {
    const list = sortVehiculosRecientesPrimero(vehiculos ?? []);
    const q = search.trim().toLowerCase();
    return list.filter((row) => {
      if (!vehiculoCoincideFiltroMesAnio(row.invoiceDate, filtroMesAnio)) {
        return false;
      }
      if (!q) return true;
      return (
        row.placa.toLowerCase().includes(q) ||
        row.marca.toLowerCase().includes(q) ||
        row.modelo.toLowerCase().includes(q) ||
        (row.vin ?? "").toLowerCase().includes(q) ||
        (row.clienteNombre ?? "").toLowerCase().includes(q) ||
        (row.clienteNit ?? "").toLowerCase().includes(q)
      );
    });
  }, [vehiculos, search, filtroMesAnio]);

  const showAll = pageSize === "all";
  const totalPages = showAll
    ? 1
    : Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = showAll ? 1 : Math.min(page, totalPages);
  const rowOffset = showAll ? 0 : (pageSafe - 1) * pageSize;
  const sliceSize = showAll ? filtered.length : pageSize;
  const pageItems = filtered.slice(rowOffset, rowOffset + sliceSize);

  return (
    <>
      {puedeGestionar ? (
        <CrearVehiculoModal open={crearOpen} onOpenChange={setCrearOpen} />
      ) : null}
      <VehiculoGaleriaViewerModal
        row={galeriaRow}
        initialView={galeriaView}
        onClose={cerrarGaleria}
      />
      {puedeGestionar ? (
        <EditarVehiculoModal
          open={editarCarId !== null}
          carId={editarCarId}
          onOpenChange={(next) => {
            if (!next) setEditarCarId(null);
          }}
        />
      ) : null}
      <div
        className={cn(
          "flex w-full min-w-0 flex-col shrink-0",
          vehiculosTablaCardShellClass,
        )}
      >
      <div className={vehiculosTablaAccentBarClass} aria-hidden />
      <div className="flex min-h-0 flex-1 flex-col bg-card dark:bg-zinc-900/40">
        <div className={vehiculosTablaToolbarSectionClass}>
          <div className={vehiculosTablaToolbarGridClass}>
            <div
              className={cn(
                vehiculosTablaToolbarFiltersClass,
                "max-lg:flex-col max-lg:items-stretch",
              )}
            >
              <div className="relative min-w-0 w-full lg:flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Buscar"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className={vehiculosTablaSearchInputClass}
                />
              </div>
            </div>

            <div
              className={cn(
                vehiculosTablaToolbarButtonsClass,
                vehiculosTablaToolbarButtonsMobileGridClass,
                "min-w-0 w-full max-lg:col-span-full",
              )}
            >
              <VehiculosFiltroMesAnioControls
                filtro={filtroMesAnio}
                onFiltro={(next) => {
                  setFiltroMesAnio(next);
                  setPage(1);
                }}
              />
              {puedeGestionar ? (
                <button
                  type="button"
                  className={vehiculosTablaAddOutlineButtonClass}
                  onClick={() => setCrearOpen(true)}
                >
                  <Plus className="size-4 shrink-0" aria-hidden />
                  Añadir
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {isLoading ? <ModuleDataLoadingPanel /> : null}

        {!isLoading && isError ? (
          <p className="px-4 py-14 text-center text-sm font-semibold text-destructive">
            No se pudo cargar la lista. Verifica la tabla{" "}
            <code className="text-xs">cars</code> en Supabase.
          </p>
        ) : null}

        {!isLoading && !isError ? (
          <>
          <VehiculosTablaDesktop
            pageItems={pageItems}
            emptyMessage={
              search.trim()
                ? "Sin coincidencias con la búsqueda."
                : "Sin registro de vehículos."
            }
            onVerGaleria={abrirGaleria}
            onVerFactura={(row) => abrirGaleria(row, "invoice")}
            canEditar={puedeGestionar}
            onEditar={(row) => setEditarCarId(row.id)}
          />

          <div className={vehiculosTablaMobileCardsWrapClass}>
            {pageItems.length === 0 ? (
              <p className="px-4 py-14 text-center text-base font-semibold text-muted-foreground">
                {search.trim()
                  ? "Sin coincidencias con la búsqueda."
                  : "Sin registro de vehículos."}
              </p>
            ) : (
              <VehiculosTablaMobileCards
                items={pageItems}
                onVerGaleria={abrirGaleria}
                onVerFactura={(row) => abrirGaleria(row, "invoice")}
                renderAcciones={(row) =>
                  puedeGestionar ? (
                    <VehiculoTablaFilaMenu
                      row={row}
                      canEditar
                      onEditar={() => setEditarCarId(row.id)}
                    />
                  ) : null
                }
              />
            )}
          </div>
          </>
        ) : null}

        {!isLoading && !isError && filtered.length > 0 ? (
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
    </>
  );
}
