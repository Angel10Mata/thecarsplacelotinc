"use client";

import type { ReactNode } from "react";
import { ModuleRouteReady } from "@/components/ui/module-route-ready";
import { cn } from "@/lib/utils";

type AppPageBackgroundProps = {
  children: ReactNode;
  centered?: boolean;
  className?: string;
  contentClassName?: string;
};

export function AppPageBackground({
  children,
  centered = false,
  className,
  contentClassName,
}: AppPageBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col w-full min-h-0 bg-background z-0 overflow-hidden",
        centered
          ? "items-center justify-center pt-10 md:pt-14 pb-8"
          : "min-h-[calc(100dvh-var(--banner-height,0px)-var(--app-header-height,var(--header-row-height)))]",
        className,
      )}
    >
      <div
        className={cn(
          "relative z-10 flex w-full flex-1 flex-col min-h-0",
          contentClassName,
        )}
      >
        <ModuleRouteReady>{children}</ModuleRouteReady>
      </div>
    </div>
  );
}
