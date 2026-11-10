import { Suspense } from "react";
import { CambiarPassword } from "@/components/(base)/(auth)/cambiar-password/CambiarPassword";

export default function CambiarPasswordPage() {
  return (
    <Suspense fallback={null}>
      <CambiarPassword />
    </Suspense>
  );
}
