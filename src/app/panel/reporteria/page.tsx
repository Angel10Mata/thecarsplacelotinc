import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerReporteria } from "@/components/(base)/reporteria/VerReporteria";

export default function ReporteriaPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerReporteria />
    </Suspense>
  );
}
