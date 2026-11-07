"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import {
  clienteDetallePath,
  guardarClienteDetalleEnSesion,
} from "./lib/rutas-clientes";
import { APP_BASE_PATH } from "@/lib/app-config";

type ClienteDetalleLegacyEntradaProps = {
  customerId: string;
};

export function ClienteDetalleLegacyEntrada({
  customerId,
}: ClienteDetalleLegacyEntradaProps) {
  const router = useRouter();

  useEffect(() => {
    guardarClienteDetalleEnSesion(customerId);
    router.replace(clienteDetallePath());
  }, [customerId, router]);

  return <ModuleDataLoadingPanel minHeightClass="min-h-[16rem]" />;
}

export function ClienteDetalleLegacyEntradaInvalida() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${APP_BASE_PATH}/clientes`);
  }, [router]);

  return <ModuleDataLoadingPanel minHeightClass="min-h-[16rem]" />;
}
