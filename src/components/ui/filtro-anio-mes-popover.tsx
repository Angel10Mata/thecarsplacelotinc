"use client";

import {
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useState,
} from "react";
import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const filtroAnioMesPopoverPanelClass = cn(
  "z-[200] box-border rounded-2xl border border-zinc-100 bg-white opacity-100 shadow-[0_16px_48px_rgba(15,23,42,0.12)]",
  "dark:border-zinc-700 dark:bg-zinc-900",
  "p-2 max-md:p-1.5 md:p-3",
);

export const filtroAnioMesMesesGridClass =
  "grid grid-cols-3 gap-1 md:gap-1.5";

export const filtroAnioMesMesBotonClass =
  "h-9 cursor-pointer rounded-xl text-xs font-semibold leading-none transition-colors md:h-10 md:text-sm";

type FiltroAnioMesPopoverContentProps = {
  children: ReactNode;
  triggerWidth?: number;
};

export function usePopoverTriggerWidth(
  triggerRef: RefObject<HTMLElement | null>,
  measureKey: string,
): number | undefined {
  const [width, setWidth] = useState<number | undefined>();

  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const update = () => {
      setWidth(el.getBoundingClientRect().width);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureKey, triggerRef]);

  return width;
}

export function FiltroAnioMesPopoverContent({
  children,
}: FiltroAnioMesPopoverContentProps) {
  return (
    <PopoverContent
      side="bottom"
      align="center"
      sideOffset={8}
      avoidCollisions
      collisionPadding={12}
      className={cn(
        filtroAnioMesPopoverPanelClass,
        "w-[min(calc(100vw-2rem),18rem)] max-w-[calc(100vw-2rem)]",
      )}
    >
      {children}
    </PopoverContent>
  );
}
