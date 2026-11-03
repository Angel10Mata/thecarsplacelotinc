"use client";

import { useState } from "react";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { modalAccentClass } from "@/components/ui/general-modal";
import { cn } from "@/lib/utils";
import { modulePageHeaderClass, modulePageHeaderRowClass, modulePageShellClass, modulePageTitleClass } from "@/lib/module-layout";
import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";
import EditarVehiculoModal from "@/components/(base)/vehiculos/forms/Editar";
import { VehiculoGaleriaViewerModal } from "@/components/(base)/vehiculos/forms/VehiculoGaleriaViewerModal";
import type { VehiculoListRow } from "@/components/(base)/vehiculos/lib/zod";
import { ClienteDetalleVehiculosTabla } from "./ClienteDetalleVehiculosTabla";
import { clientesTablaAccentBarClass } from "./lib/tabla-clientes-ui";
import { useClienteVehiculos, useCustomer } from "./lib/hooks";

type VerDetalleClienteProps = {
  customerId: string;
};

function DetalleLabel({ children }: { children: string }) {
  return (
    <dt className={cn("text-xs font-bold uppercase tracking-widest", modalAccentClass)}>
      {children}
    </dt>
  );
}

export function VerDetalleCliente({ customerId }: VerDetalleClienteProps) {
  const {
    data: cliente,
    isLoading: clienteLoading,
    isError: clienteError,
  } = useCustomer(customerId);
  const {
    data: vehiculos,
    isLoading: vehiculosLoading,
    isError: vehiculosError,
  } = useClienteVehiculos(customerId, Boolean(customerId));
  const [galeriaRow, setGaleriaRow] = useState<VehiculoListRow | null>(null);
  const [editarCarId, setEditarCarId] = useState<string | null>(null);

  const rows = vehiculos ?? [];

  return (
    <>
      <VehiculoGaleriaViewerModal
        row={galeriaRow}
        onClose={() => setGaleriaRow(null)}
      />
      <EditarVehiculoModal
        open={editarCarId !== null}
        carId={editarCarId}
        onOpenChange={(next) => {
          if (!next) setEditarCarId(null);
        }}
      />
      <div className={cn(modulePageShellClass, "min-h-0 gap-2 pt-0 pb-0 md:pt-0 md:pb-8 mt-0 md:mt-4")}>
        <header className={modulePageHeaderClass}>
          <div className={modulePageHeaderRowClass}>
            <ModuleHeaderBackButton size="sm" />
            <h1 className={modulePageTitleClass}>Detalles del cliente</h1>
          </div>
        </header>

        {clienteLoading ? <ModuleDataLoadingPanel minHeightClass="min-h-[16rem]" /> : null}

        {!clienteLoading && (clienteError || !cliente) ? (
          <p className="rounded-2xl border border-border py-14 text-center text-sm font-semibold text-destructive dark:border-zinc-700">
            No se encontró el cliente o no tienes permiso para verlo.
          </p>
        ) : null}

        {!clienteLoading && cliente ? (
          <div className="flex flex-col gap-4">
            <section
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/40",
              )}
            >
              <div className={clientesTablaAccentBarClass} aria-hidden />
              <div className="space-y-3 p-4 md:p-5">
                <h2 className="text-lg font-black uppercase leading-tight tracking-tight text-foreground md:text-xl">
                  {cliente.nombre}
                </h2>
                <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-base md:gap-y-1">
                  <div className="flex shrink-0 flex-wrap items-baseline gap-x-2">
                    <DetalleLabel>NIT</DetalleLabel>
                    <dd className="m-0 font-mono tabular-nums text-foreground">
                      {cliente.nit?.trim() || "—"}
                    </dd>
                  </div>
                  <div className="flex min-w-0 w-full flex-wrap items-baseline gap-x-2 md:w-auto md:flex-1">
                    <DetalleLabel>Dirección</DetalleLabel>
                    <dd className="m-0 min-w-0 leading-snug text-muted-foreground">
                      {cliente.direccion?.trim() || "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <ClienteDetalleVehiculosTabla
              rows={rows}
              isLoading={vehiculosLoading}
              isError={vehiculosError}
              onVerGaleria={setGaleriaRow}
              onEditar={(row) => setEditarCarId(row.id)}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
