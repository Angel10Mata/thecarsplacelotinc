"use client";

import { useRouter } from "next/navigation";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { ModalShell } from "@/components/ui/general-modal";
import { formatMarcaModeloDisplay } from "@/components/(base)/vehiculos/lib/helpers";
import { vehiculoVerEnModuloPath } from "@/components/(base)/vehiculos/lib/rutas-vehiculos";
import { cn } from "@/lib/utils";
import { useClienteVehiculos } from "./lib/hooks";
import type { ClienteListRow } from "./lib/zod";

type ClienteVehiculosListadoModalProps = {
  open: boolean;
  onClose: () => void;
  cliente: ClienteListRow | null;
};

export function ClienteVehiculosListadoModal({
  open,
  onClose,
  cliente,
}: ClienteVehiculosListadoModalProps) {
  const router = useRouter();
  const customerId = cliente?.id ?? null;
  const { data: vehiculos = [], isLoading, isError } = useClienteVehiculos(
    customerId,
    open && customerId !== null,
  );

  const titulo = cliente?.nombre ?? "Vehículos";

  return (
    <ModalShell open={open} onClose={onClose} title={titulo} maxWidth="max-w-lg">
      <div className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <ModuleDataLoadingPanel minHeightClass="min-h-[12rem]" />
        ) : null}

        {!isLoading && isError ? (
          <p className="py-8 text-center text-sm font-semibold text-destructive">
            No se pudieron cargar los vehículos.
          </p>
        ) : null}

        {!isLoading && !isError && vehiculos.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-muted-foreground">
            Este cliente no tiene vehículos registrados.
          </p>
        ) : null}

        {!isLoading && !isError && vehiculos.length > 0 ? (
          <ul className="max-h-[min(60dvh,22rem)] space-y-2 overflow-y-auto overscroll-contain scrollbar-hidden pr-0.5">
            {vehiculos.map((vehiculo) => {
              const etiqueta = formatMarcaModeloDisplay(
                vehiculo.marca,
                vehiculo.modelo,
              );
              return (
                <li key={vehiculo.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(vehiculoVerEnModuloPath(vehiculo.placa));
                    }}
                    className={cn(
                      "flex w-full cursor-pointer flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left transition-colors",
                      "hover:border-brand/40 hover:bg-brand/5",
                      "dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-brand-bright/40 dark:hover:bg-brand-bright/10",
                    )}
                  >
                    <span className="text-sm font-bold text-foreground">
                      {etiqueta}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      Factura {vehiculo.placa}
                      {vehiculo.vin ? ` · VIN ${vehiculo.vin}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </ModalShell>
  );
}
