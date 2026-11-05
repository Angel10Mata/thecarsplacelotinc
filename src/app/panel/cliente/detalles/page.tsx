import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerDetalleCliente } from "@/components/(base)/clientes/VerDetalleCliente";

export default function ClienteDetallePage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerDetalleCliente />
    </Suspense>
  );
}
