import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerUsuarios } from "@/components/(base)/(users)/usuarios/VerUsuarios";

// Usuarios del sistema
export default function UsuariosPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerUsuarios />
    </Suspense>
  );
}
