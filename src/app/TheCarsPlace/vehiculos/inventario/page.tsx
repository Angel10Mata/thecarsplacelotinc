import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerInventarioGrid } from "@/components/(base)/inventario-publico";

export default function VehiculosInventarioPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerInventarioGrid embeddedInVehiculosModule />
    </Suspense>
  );
}
