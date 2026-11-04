import { Loader2 } from "lucide-react";
import { moduleContentMaxWidth } from "@/lib/module-layout";
import { cn } from "@/lib/utils";

export const MODULE_DATA_LOADING_LABEL = "Cargando datos";

const moduleContentMinHeightClass =
  "min-h-[calc(100dvh-var(--banner-height,0px)-var(--app-header-height,var(--header-row-height)))]";

export { moduleContentMinHeightClass };

export function ModuleDataLoadingIndicator({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Loader2
        className="size-9 animate-spin text-brand dark:text-brand-bright"
        aria-hidden
      />
      <p
        className="text-sm font-semibold text-muted-foreground"
        suppressHydrationWarning
      >
        {MODULE_DATA_LOADING_LABEL}
      </p>
    </div>
  );
}

export function ModuleLoadingSurface({ className }: { className?: string }) {
  return <ModuleDataLoadingIndicator className={className} />;
}

export function ModuleDataLoadingOverlay({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-transparent",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={MODULE_DATA_LOADING_LABEL}
      suppressHydrationWarning
    >
      <ModuleLoadingSurface />
    </div>
  );
}

export function ModuleDataLoadingPanel({
  className,
  minHeightClass = "min-h-[12rem]",
}: {
  className?: string;
  minHeightClass?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center bg-transparent",
        minHeightClass,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={MODULE_DATA_LOADING_LABEL}
    >
      <ModuleLoadingSurface />
    </div>
  );
}

export function ModulePageLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col items-center justify-center bg-transparent px-3 py-8 sm:px-4 md:px-5",
        moduleContentMinHeightClass,
        className,
      )}
    >
      <div className={cn("flex w-full items-center justify-center", moduleContentMaxWidth, "mx-auto")}>
        <ModuleLoadingSurface />
      </div>
    </div>
  );
}

export function ModuleRouteSuspenseFallback() {
  return <ModulePageLoading />;
}
