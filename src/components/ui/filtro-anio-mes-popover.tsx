"use client";

import { type ReactNode } from "react";
import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const filtroAnioMesPopoverPanelClass = cn(
  "z-[200] w-[min(100vw-2rem,15.5rem)] rounded-2xl border border-zinc-100 bg-white p-1.5 opacity-100 shadow-[0_16px_48px_rgba(15,23,42,0.12)]",
  "dark:border-zinc-700 dark:bg-zinc-900",
);

type FiltroAnioMesPopoverContentProps = {
  children: ReactNode;
};

export function FiltroAnioMesPopoverContent({
  children,
}: FiltroAnioMesPopoverContentProps) {
  return (
    <PopoverContent
      side="bottom"
      align="center"
      sideOffset={8}
      className={filtroAnioMesPopoverPanelClass}
    >
      {children}
    </PopoverContent>
  );
}
