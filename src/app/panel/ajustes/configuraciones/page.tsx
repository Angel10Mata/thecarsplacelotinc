import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import VerConfiguraciones from "@/components/(base)/(settings)/VerConfiguraciones";

export default function ConfiguracionesPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerConfiguraciones />
    </Suspense>
  );
}
