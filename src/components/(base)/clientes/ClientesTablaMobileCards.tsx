"use client";

import type { ReactNode } from "react";
import { MapPin, IdCard, CarFront } from "lucide-react";
import {
  SigetMobileRecordFooter,
  SigetMobileRecordHeader,
  SigetMobileRecordList,
  SigetMobileRecordMeta,
  SigetMobileRecordMetaRow,
  SigetMobileRecordRow,
  sigetMobileRecordMetaIconClass,
} from "@/components/ui/siget-mobile-record";
import type { ClienteListRow } from "./lib/zod";
import { clientesTablaAccentTextClass } from "./lib/tabla-clientes-ui";
import { cn } from "@/lib/utils";

type ClientesTablaMobileCardsProps = {
  items: ClienteListRow[];
  rowOffset: number;
  onVerVehiculos: (row: ClienteListRow) => void;
  renderAcciones: (row: ClienteListRow) => ReactNode;
};

export function ClientesTablaMobileCards({
  items,
  rowOffset,
  onVerVehiculos,
  renderAcciones,
}: ClientesTablaMobileCardsProps) {
  return (
    <SigetMobileRecordList>
      {items.map((row, idx) => (
        <SigetMobileRecordRow key={row.id}>
          <SigetMobileRecordHeader
            title={
              <p className="capitalize break-words text-base font-bold leading-snug tracking-tight text-foreground">
                {row.nombre}
              </p>
            }
            badge={
              <span className="tabular-nums text-sm font-semibold text-muted-foreground">
                #{rowOffset + idx + 1}
              </span>
            }
          />

          <SigetMobileRecordMeta>
            <SigetMobileRecordMetaRow icon={<IdCard className={sigetMobileRecordMetaIconClass} />}>
              <span className="font-mono tabular-nums">{row.nit ?? "—"}</span>
            </SigetMobileRecordMetaRow>
            <SigetMobileRecordMetaRow icon={<CarFront className={sigetMobileRecordMetaIconClass} />}>
              <button
                type="button"
                onClick={() => onVerVehiculos(row)}
                className={cn(
                  "cursor-pointer tabular-nums text-base font-bold underline-offset-2 hover:underline",
                  clientesTablaAccentTextClass,
                )}
                aria-label={`Ver vehículos de ${row.nombre} en detalle`}
              >
                {row.vehiculosCount} vehículo{row.vehiculosCount === 1 ? "" : "s"}
              </button>
            </SigetMobileRecordMetaRow>
            <SigetMobileRecordMetaRow icon={<MapPin className={sigetMobileRecordMetaIconClass} />}>
              <span className="line-clamp-3">{row.direccion ?? "—"}</span>
            </SigetMobileRecordMetaRow>
          </SigetMobileRecordMeta>

          <SigetMobileRecordFooter right={renderAcciones(row)} />
        </SigetMobileRecordRow>
      ))}
    </SigetMobileRecordList>
  );
}
