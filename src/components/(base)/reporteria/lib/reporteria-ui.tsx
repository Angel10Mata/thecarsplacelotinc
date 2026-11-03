"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Ban as BanNode, X } from "lucide";
import {
  ModalFooter,
  ModalShell,
} from "@/components/ui/general-modal";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import { cn } from "@/lib/utils";
import { lineasEjeFechaReporteria } from "./helpers";

export function ReporteriaKpiCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-black tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

export function ReporteriaCard({
  title,
  headerAside,
  children,
  className,
}: {
  title: string;
  headerAside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-visible rounded-2xl border border-border bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 dark:border-zinc-700 md:px-6">
        <h2 className="text-lg font-black uppercase tracking-tight text-foreground md:text-xl">
          {title}
        </h2>
        {headerAside ? (
          <div className="shrink-0 text-right">{headerAside}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export const REPORTERIA_CHART_TOOLTIP_SCROLL_MIN = 8;

export function ReporteriaChartTooltipShell({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-auto w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {children}
    </div>
  );
}

export function ReporteriaChartTooltipList({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const scrollable = count >= REPORTERIA_CHART_TOOLTIP_SCROLL_MIN;

  useEffect(() => {
    const node = listRef.current;
    if (!node || !scrollable) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      node.scrollTop += event.deltaY;
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [scrollable]);

  return (
    <ul
      ref={listRef}
      className={cn(
        "mt-2 space-y-1",
        scrollable &&
          "max-h-[11.25rem] overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]",
      )}
    >
      {children}
    </ul>
  );
}

export type ReporteriaChartHoverAt = {
  x: number;
  y: number;
};

export function reporteriaChartHoverFromState<TPayload>(
  state:
    | {
        activePayload?: ReadonlyArray<{ payload: TPayload }>;
        activeCoordinate?: { x?: number; y?: number };
      }
    | null
    | undefined,
): (ReporteriaChartHoverAt & { payload: TPayload }) | null {
  const payload = state?.activePayload?.[0]?.payload;
  const x = state?.activeCoordinate?.x;
  const y = state?.activeCoordinate?.y;
  if (payload == null || x == null || y == null) return null;
  return { x, y, payload };
}

export function useReporteriaChartPinnedTooltip<TPayload>() {
  const [at, setAt] = useState<ReporteriaChartHoverAt | null>(null);
  const [punto, setPunto] = useState<TPayload | null>(null);
  const overTooltipRef = useRef(false);

  const syncFromChart = (
    state:
      | {
          activePayload?: ReadonlyArray<{ payload: TPayload }>;
          activeCoordinate?: { x?: number; y?: number };
        }
      | null
      | undefined,
  ) => {
    const hit = reporteriaChartHoverFromState(state);
    if (!hit) {
      if (!overTooltipRef.current) {
        setAt(null);
        setPunto(null);
      }
      return;
    }
    setAt({ x: hit.x, y: hit.y });
    setPunto(hit.payload);
  };

  const leaveChart = () => {
    window.setTimeout(() => {
      if (!overTooltipRef.current) {
        setAt(null);
        setPunto(null);
      }
    }, 80);
  };

  const tooltipHandlers = {
    onMouseEnter: () => {
      overTooltipRef.current = true;
    },
    onMouseLeave: () => {
      overTooltipRef.current = false;
      setAt(null);
      setPunto(null);
    },
  };

  return { at, punto, syncFromChart, leaveChart, tooltipHandlers };
}

export function ReporteriaChartTooltipFloat({
  at,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  at: ReporteriaChartHoverAt | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: ReactNode;
}) {
  if (!at) return null;

  return (
    <div
      className="pointer-events-none absolute z-[60]"
      style={{
        left: at.x,
        top: at.y,
        transform: "translate(-50%, calc(-100% - 12px))",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

export const reporteriaChartTooltipCursorOnlyStyle = {
  pointerEvents: "none" as const,
  visibility: "hidden" as const,
  width: 0,
  height: 0,
  overflow: "hidden" as const,
};

export const reporteriaChartPlotOuterClass = "px-1 pb-4 md:px-3";

export const reporteriaChartPlotClass = "relative h-[22rem] w-full min-w-0";

export function useReporteriaEjeCompacto() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return compact;
}

export function intervaloEjeReporteria(count: number, compact: boolean): number {
  if (!compact || count <= 12) return 0;
  return Math.max(0, Math.ceil(count / 7) - 1);
}

export function ReporteriaChartXTick({
  x = 0,
  y = 0,
  label,
  compact,
}: {
  x?: number | string;
  y?: number | string;
  label: string;
  compact: boolean;
}) {
  const px = Number(x);
  const py = Number(y);
  if (!label) return null;

  if (!compact) {
    return (
      <text
        x={px}
        y={py + 12}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px] font-semibold"
      >
        {label}
      </text>
    );
  }

  const [linea1, linea2] = lineasEjeFechaReporteria(label);
  return (
    <text
      x={px}
      y={py + 10}
      textAnchor="middle"
      className="fill-muted-foreground text-[9px] font-semibold"
    >
      <tspan x={px} dy="0">
        {linea1}
      </tspan>
      {linea2 ? (
        <tspan x={px} dy="10">
          {linea2}
        </tspan>
      ) : null}
    </text>
  );
}

export function reporteriaPuntoDesdeEvento<TPayload>(
  state:
    | {
        activeIndex?: number | string;
        activePayload?: ReadonlyArray<{ payload: TPayload }>;
      }
    | null
    | undefined,
  puntos: TPayload[],
): TPayload | null {
  const payload = state?.activePayload?.[0]?.payload;
  if (payload) return payload;
  const index = Number(state?.activeIndex);
  if (Number.isInteger(index) && index >= 0 && puntos[index]) {
    return puntos[index];
  }
  return null;
}

export function reporteriaPuntoDesdeClick<TPayload extends object>(
  data: unknown,
  index: unknown,
  puntos: TPayload[],
): TPayload | null {
  if (data && typeof data === "object") {
    if (
      "payload" in data &&
      data.payload &&
      typeof data.payload === "object"
    ) {
      return data.payload as TPayload;
    }
    if ("mes" in data || "fecha" in data) {
      return data as TPayload;
    }
  }
  const posicion = Number(index);
  if (Number.isInteger(posicion) && posicion >= 0 && puntos[posicion]) {
    return puntos[posicion];
  }
  return null;
}

export function ReporteriaVehiculosModal({
  open,
  onClose,
  title,
  lead,
  vehiculos,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  lead: string;
  vehiculos: Array<{ id: string; titulo: string; monto: number }>;
}) {
  return (
    <ModalShell open={open} onClose={onClose} title={title} maxWidth="max-w-lg">
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="shrink-0 text-sm font-semibold text-foreground">{lead}</p>
        {vehiculos.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            Sin compras
          </p>
        ) : (
          <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {vehiculos.map((vehiculo) => (
              <li
                key={vehiculo.id}
                className="flex items-center gap-3 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <span className="min-w-0 truncate font-bold text-foreground">
                  {vehiculo.titulo}
                </span>
                <span className="ml-auto shrink-0 font-semibold tabular-nums text-muted-foreground">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(vehiculo.monto)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <ModalFooter>
          <SigetActionButton
            label="Cerrar"
            accentColor={sigetAccent.cancelar}
            morphFrom={X}
            morphTo={BanNode}
            onClick={onClose}
            className="w-auto shrink-0"
          />
        </ModalFooter>
      </div>
    </ModalShell>
  );
}

export function formatMontoCompactoUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
