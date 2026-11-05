import { Suspense } from "react";
import { ModuleRouteSuspenseFallback } from "@/components/ui/module-page-loading";
import { VerDashboard } from "@/components/(base)/dashboard/VerDashboard";

// Panel principal
export default function DashboardPage() {
  return (
    <Suspense fallback={<ModuleRouteSuspenseFallback />}>
      <VerDashboard />
    </Suspense>
  );
}
