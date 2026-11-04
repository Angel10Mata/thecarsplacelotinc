import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerDispositivos } from "@/components/(base)/(auth)/devices/VerDispositivos";

// Dispositivos autorizados
export default function DispositivosPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerDispositivos />
    </Suspense>
  );
}
