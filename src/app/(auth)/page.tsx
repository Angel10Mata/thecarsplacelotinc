import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerInventarioGrid } from "@/components/(base)/inventario-publico";

export default function HomePage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerInventarioGrid />
    </Suspense>
  );
}
