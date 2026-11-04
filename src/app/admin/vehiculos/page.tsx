import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerVehiculos } from "@/components/(base)/vehiculos/VerVehiculos";

export default function VehiculosPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerVehiculos />
    </Suspense>
  );
}
