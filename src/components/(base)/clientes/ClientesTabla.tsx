"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Loader2,
  PenSquare,
  Plus,
  Search,
} from "lucide-react";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { cn } from "@/lib/utils";
import {
  sigetTablaAccionesMenuBotonClass,
  sigetTablaCeldaAccionesClass,
  sigetTablaCeldaBotonCentrarClass,
  sigetTablaCeldaBotonCompactClass,
  sigetTablaCeldaBotonHeaderClass,
} from "@/components/ui/siget-tabla-acciones-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SigetTablaPageSizeSelect,
  type SigetTablaPageSizeValue,
} from "@/components/ui/siget-tabla-page-size-select";
import {
  clientesTablaAccentBarClass,
  clientesTablaAddOutlineButtonClass,
  clientesTablaBodyRowClass,
  clientesTablaCardShellClass,
  clientesTablaCellDividerClass,
  clientesTablaHeadRowClass,
  clientesTablaAccentTextClass,
  clientesTablaPaginationBarClass,
  clientesTablaPaginationControlClass,
  clientesTablaSearchInputClass,
  clientesTablaToolbarButtonsClass,
  clientesTablaToolbarButtonsMobileGridClass,
  clientesTablaToolbarFiltersClass,
  clientesTablaToolbarGridClass,
  clientesTablaToolbarSectionClass,
  clientesTablaAnchoAcc,
  clientesTablaAnchoNit,
  clientesTablaAnchoNombre,
  clientesTablaAnchoNo,
  clientesTablaAnchoVeh,
  clientesTablaColAnchoStyle,
  clientesTablaDesktopTableWrapClass,
  clientesTablaMobileCardsWrapClass,
} from "./lib/tabla-clientes-ui";
import { ClientesTablaMobileCards } from "./ClientesTablaMobileCards";
import CrearClienteModal from "./forms/Crear";
import EditarClienteModal from "./forms/Editar";
import { useCustomers } from "./lib/hooks";
import { clienteDetallePath, guardarClienteDetalleEnSesion } from "./lib/rutas-clientes";
import type { ClienteListRow } from "./lib/zod";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { canEditClientesYVehiculos } from "@/components/(base)/(users)/usuarios/lib/permissions";

const cellPad = "px-3 py-3.5";
const cellPadEstrecho = "px-1.5 py-3.5";
type PageSize = SigetTablaPageSizeValue;

function ClienteFilaMenu({
  row,
  onEditar,
  canEditar = true,
}: {
  row: ClienteListRow;
  onEditar: () => void;
  canEditar?: boolean;
}) {
  if (!canEditar) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={sigetTablaAccionesMenuBotonClass}
          aria-label={`Acciones para ${row.nombre}`}
        >
          <EllipsisVertical className="size-5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="left"
        align="center"
        sideOffset={6}
        className="z-[200] w-auto min-w-0 border-border bg-white p-1 opacity-100 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <DropdownMenuItem
          className="cursor-pointer gap-2 px-2.5 py-2 font-semibold"
          onSelect={() => onEditar()}
        >
          <PenSquare className="size-4 text-brand dark:text-brand-bright" />
          Editar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ClientesTabla() {
  const router = useRouter();
  const { effectiveRole } = useUserContext();
  const canEditar = canEditClientesYVehiculos(effectiveRole);
  const { data: clientes, isLoading, isError } = useCustomers();
  const [crearOpen, setCrearOpen] = useState(false);
  const [editarCliente, setEditarCliente] = useState<ClienteListRow | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(15);
  const [placeholderBuscar, setPlaceholderBuscar] = useState(
    "Buscar por nombre, NIT o dirección...",
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () =>
      setPlaceholderBuscar(
        mq.matches ? "Buscar" : "Buscar por nombre, NIT o dirección...",
      );
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const filtered = useMemo(() => {
    const list = clientes ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (row) =>
        row.nombre.toLowerCase().includes(q) ||
        (row.nit ?? "").toLowerCase().includes(q) ||
        (row.direccion ?? "").toLowerCase().includes(q),
    );
  }, [clientes, search]);

  const showAll = pageSize === "all";
  const totalPages = showAll
    ? 1
    : Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = showAll ? 1 : Math.min(page, totalPages);
  const rowOffset = showAll ? 0 : (pageSafe - 1) * pageSize;
  const sliceSize = showAll ? filtered.length : pageSize;
  const pageItems = filtered.slice(rowOffset, rowOffset + sliceSize);

  const abrirDetalleCliente = (row: ClienteListRow) => {
    guardarClienteDetalleEnSesion(row.id);
    router.push(clienteDetallePath());
  };

  return (
    <>
      <CrearClienteModal open={crearOpen} onOpenChange={setCrearOpen} />
      {canEditar ? (
        <EditarClienteModal
          open={editarCliente !== null}
          onOpenChange={(open) => {
            if (!open) setEditarCliente(null);
          }}
          cliente={editarCliente}
        />
      ) : null}
      <div
        className={cn(
          "flex w-full min-w-0 flex-col shrink-0",
          clientesTablaCardShellClass,
        )}
      >
        <div className={clientesTablaAccentBarClass} aria-hidden />
        <div className="flex min-h-0 flex-1 flex-col bg-card dark:bg-zinc-900/40">
          <div className={clientesTablaToolbarSectionClass}>
            <div className={clientesTablaToolbarGridClass}>
              <div
                className={cn(
                  clientesTablaToolbarFiltersClass,
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
                    placeholder={placeholderBuscar}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className={clientesTablaSearchInputClass}
                  />
                </div>
              </div>
              <div
                className={cn(
                  clientesTablaToolbarButtonsClass,
                  clientesTablaToolbarButtonsMobileGridClass,
                  "min-w-0 w-full max-lg:col-span-full",
                )}
              >
                <button
                  type="button"
                  className={clientesTablaAddOutlineButtonClass}
                  onClick={() => setCrearOpen(true)}
                >
                  <Plus className="size-4 shrink-0" aria-hidden />
                  Añadir
                </button>
              </div>
            </div>
          </div>

          {isLoading ? <ModuleDataLoadingPanel className="mx-4" /> : null}

          {isError ? (
            <p className="px-4 py-14 text-center text-sm font-semibold text-muted-foreground">
              No se pudo cargar la lista. Verifica la tabla{" "}
              <code className="text-xs">customers</code> en Supabase.
            </p>
          ) : null}

          {!isLoading && !isError ? (
            <>
            <div className={clientesTablaDesktopTableWrapClass}>
              <table className="w-full border-collapse text-base">
                <colgroup>
                  <col style={clientesTablaColAnchoStyle(clientesTablaAnchoNo)} />
                  <col
                    style={clientesTablaColAnchoStyle(clientesTablaAnchoNombre)}
                  />
                  <col style={clientesTablaColAnchoStyle(clientesTablaAnchoNit)} />
                  <col />
                  <col style={clientesTablaColAnchoStyle(clientesTablaAnchoVeh)} />
                  {canEditar ? (
                    <col style={clientesTablaColAnchoStyle(clientesTablaAnchoAcc)} />
                  ) : null}
                </colgroup>
                <thead>
                  <tr className={clientesTablaHeadRowClass}>
                    <th
                      className={cn(
                        cellPadEstrecho,
                        clientesTablaCellDividerClass,
                        "w-0 whitespace-nowrap text-center",
                      )}
                      style={clientesTablaColAnchoStyle(clientesTablaAnchoNo)}
                    >
                      No.
                    </th>
                    <th
                      className={cn(
                        cellPad,
                        clientesTablaCellDividerClass,
                        "min-w-0 text-center",
                      )}
                      style={clientesTablaColAnchoStyle(clientesTablaAnchoNombre)}
                    >
                      Nombre
                    </th>
                    <th
                      className={cn(
                        cellPadEstrecho,
                        clientesTablaCellDividerClass,
                        "w-0 min-w-max whitespace-nowrap text-center",
                      )}
                      style={clientesTablaColAnchoStyle(clientesTablaAnchoNit)}
                    >
                      NIT
                    </th>
                    <th
                      className={cn(
                        cellPad,
                        clientesTablaCellDividerClass,
                        "min-w-0 w-full text-center",
                      )}
                    >
                      Dirección
                    </th>
                    <th
                      className={cn(
                        sigetTablaCeldaBotonHeaderClass,
                        clientesTablaCellDividerClass,
                      )}
                      style={clientesTablaColAnchoStyle(clientesTablaAnchoVeh)}
                    >
                      Veh.
                    </th>
                    {canEditar ? (
                      <th
                        className={sigetTablaCeldaBotonHeaderClass}
                        style={clientesTablaColAnchoStyle(clientesTablaAnchoAcc)}
                      >
                        ACC
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={canEditar ? 6 : 5}
                        className="px-4 py-14 text-center text-sm font-semibold text-muted-foreground"
                      >
                        {search.trim()
                          ? "Sin coincidencias con la búsqueda."
                          : "Sin clientes. Usa Añadir para registrar uno."}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((row, idx) => (
                      <tr key={row.id} className={clientesTablaBodyRowClass}>
                        <td
                          className={cn(
                            cellPadEstrecho,
                            clientesTablaCellDividerClass,
                            "w-0 whitespace-nowrap text-center tabular-nums font-medium text-muted-foreground",
                          )}
                          style={clientesTablaColAnchoStyle(clientesTablaAnchoNo)}
                        >
                          {rowOffset + idx + 1}
                        </td>
                        <td
                          className={cn(
                            cellPad,
                            clientesTablaCellDividerClass,
                            "min-w-0 font-semibold text-foreground",
                          )}
                          style={clientesTablaColAnchoStyle(clientesTablaAnchoNombre)}
                        >
                          {row.nombre}
                        </td>
                        <td
                          className={cn(
                            cellPadEstrecho,
                            clientesTablaCellDividerClass,
                            "w-0 min-w-max whitespace-nowrap text-center font-mono tabular-nums",
                          )}
                          style={clientesTablaColAnchoStyle(clientesTablaAnchoNit)}
                        >
                          {row.nit ?? "—"}
                        </td>
                        <td
                          className={cn(
                            cellPad,
                            clientesTablaCellDividerClass,
                            "min-w-0 w-full text-muted-foreground",
                          )}
                        >
                          {row.direccion ?? "—"}
                        </td>
                        <td
                          className={cn(
                            sigetTablaCeldaBotonCompactClass,
                            clientesTablaCellDividerClass,
                          )}
                          style={clientesTablaColAnchoStyle(clientesTablaAnchoVeh)}
                        >
                          <div className={sigetTablaCeldaBotonCentrarClass}>
                            <button
                              type="button"
                              onClick={() => abrirDetalleCliente(row)}
                              className={cn(
                                sigetTablaAccionesMenuBotonClass,
                                "h-9 min-w-9 w-auto px-1.5 text-sm font-bold tabular-nums",
                              )}
                              aria-label={`Ver vehículos de ${row.nombre} en detalle`}
                            >
                              {row.vehiculosCount}
                            </button>
                          </div>
                        </td>
                        {canEditar ? (
                          <td
                            className={sigetTablaCeldaAccionesClass}
                            style={clientesTablaColAnchoStyle(clientesTablaAnchoAcc)}
                          >
                            <div className={sigetTablaCeldaBotonCentrarClass}>
                              <ClienteFilaMenu
                                row={row}
                                canEditar
                                onEditar={() => setEditarCliente(row)}
                              />
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={clientesTablaMobileCardsWrapClass}>
              {pageItems.length === 0 ? (
                <p className="px-4 py-14 text-center text-base font-semibold text-muted-foreground">
                  {search.trim()
                    ? "Sin coincidencias con la búsqueda."
                    : "Sin clientes. Usa Añadir para registrar uno."}
                </p>
              ) : (
                <ClientesTablaMobileCards
                  items={pageItems}
                  rowOffset={rowOffset}
                  onVerVehiculos={abrirDetalleCliente}
                  renderAcciones={(row) =>
                    canEditar ? (
                      <ClienteFilaMenu
                        row={row}
                        canEditar
                        onEditar={() => setEditarCliente(row)}
                      />
                    ) : null
                  }
                />
              )}
            </div>
            </>
          ) : null}

          {!isLoading && !isError && filtered.length > 0 ? (
            <div className={clientesTablaPaginationBarClass}>
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
                className={clientesTablaPaginationControlClass}
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <span
                className={cn(
                  "min-w-[3.5rem] text-center text-base font-bold tabular-nums",
                  clientesTablaAccentTextClass,
                )}
              >
                {pageSafe}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe >= totalPages}
                className={clientesTablaPaginationControlClass}
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
