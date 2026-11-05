"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { modalAccentClass } from "@/components/ui/general-modal";
import { cn } from "@/lib/utils";
import { modulePageHeaderClass, modulePageHeaderStackClass, modulePageShellClass, modulePageTitleClass } from "@/lib/module-layout";
import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";
import EditarVehiculoModal from "@/components/(base)/vehiculos/forms/Editar";
import {
  VehiculoGaleriaViewerModal,
  type VehiculoGaleriaView,
} from "@/components/(base)/vehiculos/forms/VehiculoGaleriaViewerModal";
import type { VehiculoListRow } from "@/components/(base)/vehiculos/lib/zod";
import { ClienteDetalleVehiculosTabla } from "./ClienteDetalleVehiculosTabla";
import { getCustomerByRefAction } from "./lib/actions";
import { useClienteDetalle } from "./lib/hooks";
import {
  clienteDetallePath,
  guardarClienteDetalleEnSesion,
  leerClienteDetalleEnSesion,
} from "./lib/rutas-clientes";
import { clientesTablaAccentBarClass } from "./lib/tabla-clientes-ui";

function DetalleLabel({ children }: { children: string }) {
  return (
    <dt className={cn("text-xs font-bold uppercase tracking-widest", modalAccentClass)}>
      {children}
    </dt>
  );
}

export function VerDetalleCliente() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [entradaLista, setEntradaLista] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolverEntrada() {
      const nit = searchParams.get("nit")?.trim() ?? "";
      const nombre = searchParams.get("nombre")?.trim() ?? "";
      const tieneQueryLegacy = nit.length > 0 || nombre.length > 0;

      if (tieneQueryLegacy) {
        const res = await getCustomerByRefAction({
          nit: nit || undefined,
          nombre: nombre || undefined,
        });
        if (cancelled) return;
        if (res.ok) {
          guardarClienteDetalleEnSesion(res.data.id);
          setCustomerId(res.data.id);
          router.replace(clienteDetallePath(), { scroll: false });
        } else {
          setCustomerId(null);
        }
        setEntradaLista(false);
        return;
      }

      const id = leerClienteDetalleEnSesion();
      if (cancelled) return;
      setCustomerId(id);
      setEntradaLista(false);
    }

    void resolverEntrada();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const {
    data: detalle,
    isPending: detallePending,
    isError: detalleError,
  } = useClienteDetalle(customerId, Boolean(customerId) && !entradaLista);
  const [galeriaRow, setGaleriaRow] = useState<VehiculoListRow | null>(null);
  const [galeriaView, setGaleriaView] = useState<VehiculoGaleriaView>("photos");
  const [editarCarId, setEditarCarId] = useState<string | null>(null);

  const abrirGaleria = (
    row: VehiculoListRow,
    view: VehiculoGaleriaView = "photos",
  ) => {
    setGaleriaView(view);
    setGaleriaRow(row);
  };

  const cliente = detalle?.cliente ?? null;
  const rows = detalle?.vehiculos ?? [];
  const pageLoading =
    entradaLista || (Boolean(customerId) && detallePending);
  const sinCliente =
    !entradaLista &&
    (!customerId || detalleError || (!detallePending && !cliente));

  return (
    <>
      <VehiculoGaleriaViewerModal
        row={galeriaRow}
        initialView={galeriaView}
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
          <div className={modulePageHeaderStackClass}>
            <ModuleHeaderBackButton />
            <h1 className={modulePageTitleClass}>Detalles del cliente</h1>
          </div>
        </header>

        {pageLoading ? <ModuleDataLoadingPanel minHeightClass="min-h-[16rem]" /> : null}

        {!pageLoading && sinCliente ? (
          <p className="rounded-2xl border border-border py-14 text-center text-sm font-semibold text-destructive dark:border-zinc-700">
            No se encontró el cliente o no tienes permiso para verlo.
          </p>
        ) : null}

        {!pageLoading && cliente ? (
          <div className="flex flex-col gap-4">
            <section
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
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
              isLoading={false}
              isError={false}
              onVerGaleria={abrirGaleria}
              onVerFactura={(row) => abrirGaleria(row, "invoice")}
              onEditar={(row) => setEditarCarId(row.id)}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
