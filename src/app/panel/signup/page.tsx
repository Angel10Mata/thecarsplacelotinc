import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import RegistroUsuario from "@/components/(base)/(auth)/signup/RegistroUsuario";

// Registro de farmacia
export default function SignupPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <RegistroUsuario />
    </Suspense>
  );
}
