import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerAdmin } from "@/components/(base)/admin/VerAdmin";

export default function AdminPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerAdmin />
    </Suspense>
  );
}
