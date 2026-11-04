import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerClientes } from "@/components/(base)/clientes/VerClientes";

export default function ClientesPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerClientes />
    </Suspense>
  );
}
