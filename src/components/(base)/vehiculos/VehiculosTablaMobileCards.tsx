"use client";

import type { ReactNode } from "react";
import { Image as ImageNode, Images as ImagesNode } from "lucide";
import { Hash, User } from "lucide-react";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import { sigetTablaFotosVerBotonClass } from "@/components/ui/siget-tabla-acciones-ui";
import { cn } from "@/lib/utils";
import {
  SigetMobileRecordHeader,
  SigetMobileRecordList,
  SigetMobileRecordMeta,
  SigetMobileRecordMetaRow,
  SigetMobileRecordRow,
  sigetMobileRecordMetaIconClass,
  sigetMobileRecordSubtitleClass,
  sigetMobileRecordTitleClass,
} from "@/components/ui/siget-mobile-record";
import type { VehiculoListRow } from "./lib/zod";

export function VehiculoFacturaChip({
  placa,
  onClick,
  compact = false,
}: {
  placa: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver factura ${placa}`}
      className={cn(
        "inline-flex max-w-full items-center rounded-lg bg-zinc-100 px-2.5 py-1 font-black uppercase tracking-wider text-foreground transition-colors",
        "cursor-pointer hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600",
        compact
          ? "w-max justify-center whitespace-nowrap text-sm"
          : "text-base",
      )}
    >
      {placa}
    </button>
  );
}

type VehiculosTablaMobileCardsProps = {
  items: VehiculoListRow[];
  showCliente?: boolean;
  onVerGaleria: (row: VehiculoListRow) => void;
  onVerFactura: (row: VehiculoListRow) => void;
  renderAcciones: (row: VehiculoListRow) => ReactNode;
};

export function VehiculosTablaMobileCards({
  items,
  showCliente = true,
  onVerGaleria,
  onVerFactura,
  renderAcciones,
}: VehiculosTablaMobileCardsProps) {
  return (
    <SigetMobileRecordList>
      {items.map((row) => (
        <SigetMobileRecordRow key={row.id}>
          <SigetMobileRecordHeader
            title={
              <div className="min-w-0">
                <p className={sigetMobileRecordTitleClass}>
                  <VehiculoFacturaChip
                    placa={row.placa}
                    onClick={() => onVerFactura(row)}
                  />
                </p>
                <p className={`mt-1.5 capitalize ${sigetMobileRecordSubtitleClass}`}>
                  {row.marca}
                  {row.modelo !== "—" ? ` · ${row.modelo}` : ""}
                </p>
              </div>
            }
            badge={
              <span className="tabular-nums text-sm font-semibold text-muted-foreground">
                #{row.numeroRegistro}
              </span>
            }
          />

          <SigetMobileRecordMeta>
            {showCliente ? (
              <SigetMobileRecordMetaRow icon={<User className={sigetMobileRecordMetaIconClass} />}>
                {row.clienteNombre ?? "—"}
              </SigetMobileRecordMetaRow>
            ) : null}
            <SigetMobileRecordMetaRow
              icon={<Hash className={sigetMobileRecordMetaIconClass} />}
              trailing={
                <>
                  <SigetActionButton
                    label="Ver"
                    accentColor={sigetAccent.abrir}
                    morphFrom={ImageNode}
                    morphTo={ImagesNode}
                    onClick={() => onVerGaleria(row)}
                    className={sigetTablaFotosVerBotonClass}
                    ariaLabel={`Ver fotos y factura de ${row.placa}`}
                  />
                  {renderAcciones(row)}
                </>
              }
            >
              <span className="font-mono text-sm uppercase tracking-tight">
                {row.vin ?? "—"}
              </span>
            </SigetMobileRecordMetaRow>
          </SigetMobileRecordMeta>
        </SigetMobileRecordRow>
      ))}
    </SigetMobileRecordList>
  );
}
