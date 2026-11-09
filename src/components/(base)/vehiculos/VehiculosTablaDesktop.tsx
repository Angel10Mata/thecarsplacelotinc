"use client";

import { Image as ImageNode, Images as ImagesNode } from "lucide";
import { EllipsisVertical, PenSquare } from "lucide-react";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  sigetTablaAccionesMenuBotonClass,
  sigetTablaAnchoAccionesColStyle,
  sigetTablaCeldaAccionesClass,
  sigetTablaCeldaBotonCentrarClass,
  sigetTablaCeldaBotonHeaderClass,
  sigetTablaCeldaFotosVerClass,
  sigetTablaFotosVerBotonClass,
} from "@/components/ui/siget-tabla-acciones-ui";
import type { VehiculoListRow } from "./lib/zod";
import {
  vehiculosTablaAnchoCliente,
  vehiculosTablaAnchoFactura,
  vehiculosTablaAnchoFotos,
  vehiculosTablaAnchoMarcaModelo,
  vehiculosTablaAnchoNo,
  vehiculosTablaAnchoVin,
  vehiculosTablaBodyRowClass,
  vehiculosTablaCellDividerClass,
  vehiculosTablaColAnchoStyle,
  vehiculosTablaDesktopTableWrapClass,
  vehiculosTablaHeadRowClass,
} from "./lib/tabla-vehiculos-ui";
import { VehiculoFacturaChip } from "./VehiculosTablaMobileCards";
import { prefetchInvoicePdfLibs } from "./lib/vehiculo-react-pdf";

const cellPad = "px-3 py-3.5";
const cellPadEstrecho = "px-1.5 py-3.5";
const marcaModeloCell = "pl-2.5 pr-1";

export function VehiculoTablaFilaMenu({
  row,
  onEditar,
}: {
  row: VehiculoListRow;
  onEditar: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={sigetTablaAccionesMenuBotonClass}
          aria-label={`Acciones para ${row.placa}`}
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

function VehiculosTablaFotoCell({
  row,
  onOpen,
}: {
  row: VehiculoListRow;
  onOpen: () => void;
}) {
  return (
    <span
      className="inline-flex"
      onPointerEnter={prefetchInvoicePdfLibs}
      onFocus={prefetchInvoicePdfLibs}
    >
      <SigetActionButton
        label="Ver"
        accentColor={sigetAccent.abrir}
        morphFrom={ImageNode}
        morphTo={ImagesNode}
        onClick={onOpen}
        className={sigetTablaFotosVerBotonClass}
        ariaLabel={`Ver fotos y factura de ${row.placa}`}
      />
    </span>
  );
}

type VehiculosTablaDesktopProps = {
  pageItems: VehiculoListRow[];
  emptyMessage: string;
  onVerGaleria: (row: VehiculoListRow) => void;
  onVerFactura: (row: VehiculoListRow) => void;
  onEditar: (row: VehiculoListRow) => void;
};

export function VehiculosTablaDesktop({
  pageItems,
  emptyMessage,
  onVerGaleria,
  onVerFactura,
  onEditar,
}: VehiculosTablaDesktopProps) {
  return (
    <div className={vehiculosTablaDesktopTableWrapClass}>
      <table className="w-full table-fixed border-collapse text-base">
        <colgroup>
          <col style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoNo)} />
          <col />
          <col style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoVin)} />
          <col />
          <col style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoFactura)} />
          <col style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoFotos)} />
          <col style={sigetTablaAnchoAccionesColStyle} />
        </colgroup>
        <thead>
          <tr className={vehiculosTablaHeadRowClass}>
            <th
              className={cn(
                cellPadEstrecho,
                vehiculosTablaCellDividerClass,
                "text-center",
              )}
              style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoNo)}
            >
              No.
            </th>
            <th
              className={cn(
                cellPad,
                vehiculosTablaCellDividerClass,
                "min-w-0 text-center",
              )}
              style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoMarcaModelo)}
            >
              Marca / Modelo
            </th>
            <th
              className={cn(cellPad, vehiculosTablaCellDividerClass, "text-center")}
              style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoVin)}
            >
              VIN
            </th>
            <th
              className={cn(
                cellPad,
                vehiculosTablaCellDividerClass,
                "min-w-0 text-center",
              )}
              style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoCliente)}
            >
              Cliente
            </th>
            <th
              className={cn(
                cellPadEstrecho,
                vehiculosTablaCellDividerClass,
                "whitespace-nowrap text-center",
              )}
            >
              Factura
            </th>
            <th
              className={cn(
                sigetTablaCeldaBotonHeaderClass,
                vehiculosTablaCellDividerClass,
              )}
              style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoFotos)}
            >
              Fotos
            </th>
            <th
              className={sigetTablaCeldaBotonHeaderClass}
              style={sigetTablaAnchoAccionesColStyle}
            >
              ACC
            </th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-14 text-center text-sm font-semibold text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            pageItems.map((row) => (
              <tr key={row.id} className={vehiculosTablaBodyRowClass}>
                <td
                  className={cn(
                    cellPadEstrecho,
                    vehiculosTablaCellDividerClass,
                    "whitespace-nowrap text-center align-middle tabular-nums font-medium text-muted-foreground",
                  )}
                  style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoNo)}
                >
                  {row.numeroRegistro}
                </td>
                <td
                  className={cn(
                    cellPad,
                    vehiculosTablaCellDividerClass,
                    "min-w-0 text-left align-middle break-words whitespace-normal",
                    marcaModeloCell,
                  )}
                >
                  <span className="inline-flex max-w-full flex-col items-start leading-snug capitalize">
                    <span className="break-words font-semibold text-foreground">
                      {row.marca}
                    </span>
                    {row.modelo !== "—" ? (
                      <span className="break-words text-base text-muted-foreground">
                        {row.modelo}
                      </span>
                    ) : null}
                  </span>
                </td>
                <td
                  className={cn(
                    cellPad,
                    vehiculosTablaCellDividerClass,
                    "whitespace-nowrap text-center align-middle text-sm font-mono uppercase tracking-tight",
                  )}
                  style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoVin)}
                >
                  {row.vin ?? "—"}
                </td>
                <td
                  className={cn(
                    cellPad,
                    vehiculosTablaCellDividerClass,
                    "min-w-0 align-middle text-left break-words whitespace-normal",
                    marcaModeloCell,
                  )}
                >
                  {row.clienteNombre ? (
                    <span className="font-semibold leading-snug text-foreground">
                      {row.clienteNombre}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                <td
                  className={cn(
                    cellPadEstrecho,
                    vehiculosTablaCellDividerClass,
                    "whitespace-nowrap text-center align-middle",
                  )}
                >
                  <VehiculoFacturaChip
                    placa={row.placa}
                    compact
                    onPrefetch={prefetchInvoicePdfLibs}
                    onClick={() => onVerFactura(row)}
                  />
                </td>
                <td
                  className={cn(
                    sigetTablaCeldaFotosVerClass,
                    vehiculosTablaCellDividerClass,
                  )}
                  style={vehiculosTablaColAnchoStyle(vehiculosTablaAnchoFotos)}
                >
                  <div className={sigetTablaCeldaBotonCentrarClass}>
                    <VehiculosTablaFotoCell
                      row={row}
                      onOpen={() => onVerGaleria(row)}
                    />
                  </div>
                </td>
                <td
                  className={sigetTablaCeldaAccionesClass}
                  style={sigetTablaAnchoAccionesColStyle}
                >
                  <div className={sigetTablaCeldaBotonCentrarClass}>
                    <VehiculoTablaFilaMenu
                      row={row}
                      onEditar={() => onEditar(row)}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
