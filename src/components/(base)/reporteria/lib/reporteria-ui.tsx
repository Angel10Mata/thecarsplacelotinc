"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ban as BanNode, X } from "lucide";
import { X as XIcon } from "lucide-react";
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
        "overflow-visible rounded-2xl border border-border bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
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

export const REPORTERIA_CHART_TOOLTIP_SCROLL_MIN = 4;

const REPORTERIA_CHART_TOOLTIP_EDGE_INSET = 12;
const REPORTERIA_CHART_TOOLTIP_MAX_WIDTH_PX = 320;

function reporteriaChartTooltipTransform(
  x: number,
  plotWidth: number,
): string {
  const yPart = "calc(-100% - 14px)";
  const pad = REPORTERIA_CHART_TOOLTIP_EDGE_INSET;
  const half = REPORTERIA_CHART_TOOLTIP_MAX_WIDTH_PX / 2;

  if (plotWidth <= 0) {
    return `translate(-50%, ${yPart})`;
  }
  if (x < half + pad) {
    return `translate(${pad}px, ${yPart})`;
  }
  if (x > plotWidth - half - pad) {
    return `translate(calc(-100% - ${pad}px), ${yPart})`;
  }
  return `translate(-50%, ${yPart})`;
}

export function ReporteriaChartTooltipShell({
  children,
  pinned,
  onClose,
}: {
  children: ReactNode;
  pinned?: boolean;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative pointer-events-auto w-max max-w-[min(calc(100vw-2rem),20rem)] rounded-xl border bg-white px-3 py-2.5 shadow-md dark:bg-zinc-900",
        pinned
          ? "border-brand dark:border-brand-bright"
          : "border-zinc-200 dark:border-zinc-700",
      )}
    >
      {onClose ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="absolute right-1.5 top-1.5 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Cerrar"
        >
          <XIcon className="size-4" strokeWidth={2.25} />
        </button>
      ) : null}
      {children}
    </div>
  );
}

export function ReporteriaChartTooltipHeader({
  title,
  trailing,
  withClose,
}: {
  title: string;
  trailing: ReactNode;
  withClose?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="min-w-0 text-xs font-bold uppercase tracking-widest text-brand dark:text-brand-bright">
        {title}
      </p>
      <p
        className={cn(
          "shrink-0 text-right text-sm font-semibold tabular-nums text-foreground",
          withClose && "pr-7",
        )}
      >
        {trailing}
      </p>
    </div>
  );
}

export function ReporteriaChartTooltipVehiculoRow({
  titulo,
  montoLabel,
}: {
  titulo: string;
  montoLabel: string;
}) {
  return (
    <li className="flex items-start gap-3 py-2.5 text-xs font-medium text-muted-foreground first:pt-0">
      <span className="min-w-0 flex-1 break-words font-bold text-foreground">
        {titulo}
      </span>
      <span className="shrink-0 text-right tabular-nums font-semibold text-foreground">
        {montoLabel}
      </span>
    </li>
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
          "max-h-[10rem] overflow-y-auto overscroll-contain scrollbar-hidden [-webkit-overflow-scrolling:touch]",
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

export function reporteriaChartTooltipAtFromBarTarget(
  nativeEvent: Event | undefined,
  plotEl: HTMLElement | null,
): ReporteriaChartHoverAt | null {
  if (!nativeEvent || !plotEl) return null;
  const target = nativeEvent.target;
  if (!(target instanceof SVGGraphicsElement)) return null;

  try {
    const bbox = target.getBBox();
    const svg = target.ownerSVGElement;
    const matrix = target.getScreenCTM();
    if (!svg || !matrix) return null;

    const plotRect = plotEl.getBoundingClientRect();
    const point = svg.createSVGPoint();
    point.x = bbox.x + bbox.width / 2;
    point.y = bbox.y;
    const screen = point.matrixTransform(matrix);

    return {
      x: screen.x - plotRect.left,
      y: screen.y - plotRect.top,
    };
  } catch {
    return null;
  }
}

export function useReporteriaChartPinnedTooltip<TPayload>() {
  const [at, setAt] = useState<ReporteriaChartHoverAt | null>(null);
  const [punto, setPunto] = useState<TPayload | null>(null);
  const [pinned, setPinned] = useState(false);
  const overTooltipRef = useRef(false);

  const applyHit = (hit: ReporteriaChartHoverAt & { payload: TPayload }) => {
    setAt({ x: hit.x, y: hit.y });
    setPunto(hit.payload);
  };

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
      if (!pinned && !overTooltipRef.current) {
        setAt(null);
        setPunto(null);
      }
      return;
    }
    if (!pinned) {
      applyHit(hit);
    }
  };

  const leaveChart = () => {
    window.setTimeout(() => {
      if (!pinned && !overTooltipRef.current) {
        setAt(null);
        setPunto(null);
      }
    }, 80);
  };

  const pinPunto = (payload: TPayload, position: ReporteriaChartHoverAt) => {
    setPinned(true);
    setAt(position);
    setPunto(payload);
  };

  const showAt = (payload: TPayload, position: ReporteriaChartHoverAt) => {
    if (pinned) return;
    applyHit({ ...position, payload });
  };

  const togglePinFromHover = () => {
    if (pinned) {
      setPinned(false);
      setAt(null);
      setPunto(null);
      return;
    }
    if (punto && at) {
      setPinned(true);
    }
  };

  const clearPin = () => {
    setPinned(false);
    setAt(null);
    setPunto(null);
  };

  const tooltipHandlers = {
    onMouseEnter: () => {
      overTooltipRef.current = true;
    },
    onMouseLeave: () => {
      overTooltipRef.current = false;
      if (!pinned) {
        setAt(null);
        setPunto(null);
      }
    },
  };

  return {
    at,
    punto,
    pinned,
    syncFromChart,
    leaveChart,
    pinPunto,
    showAt,
    togglePinFromHover,
    clearPin,
    tooltipHandlers,
  };
}

export function ReporteriaChartTooltipFloat({
  at,
  pinned,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  at: ReporteriaChartHoverAt | null;
  pinned?: boolean;
  onDismiss?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: ReactNode;
}) {
  const compact = useReporteriaEjeCompacto();
  const [portalReady, setPortalReady] = useState(false);
  const floatRef = useRef<HTMLDivElement>(null);
  const [plotWidth, setPlotWidth] = useState(0);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useLayoutEffect(() => {
    const plot = floatRef.current?.offsetParent;
    if (!(plot instanceof HTMLElement)) {
      setPlotWidth(0);
      return;
    }

    const sync = () => setPlotWidth(plot.clientWidth);
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(plot);
    return () => observer.disconnect();
  }, [at]);

  if (!at) return null;

  if (compact && pinned) {
    if (!portalReady) return null;

    return createPortal(
      <>
        <button
          type="button"
          aria-label="Cerrar detalle"
          className="fixed inset-0 z-[200] cursor-default bg-black/25"
          onClick={onDismiss}
        />
        <div
          className="fixed left-1/2 top-1/2 z-[210] flex max-h-[min(70dvh,calc(100dvh-6rem))] w-max max-w-[min(calc(100vw-2rem),20rem)] -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </div>
      </>,
      document.body,
    );
  }

  return (
    <div
      ref={floatRef}
      className={cn(
        "absolute z-[60] pointer-events-auto",
        pinned && "z-[70]",
      )}
      style={{
        left: at.x,
        top: at.y,
        transform: reporteriaChartTooltipTransform(at.x, plotWidth),
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

export const reporteriaChartPlotOuterClass = "overflow-x-visible px-2 pb-4 md:px-4";

export const reporteriaChartPlotClass = "relative h-[22rem] w-full min-w-0";
export function ReporteriaChartClickHint({
  label = "Haz clic en un punto para ver los vehículos.",
}: {
  label?: string;
}) {
  return (
    <p className="mt-2 border-t border-zinc-200/80 px-1 pt-3 text-center text-[11px] font-semibold leading-snug text-muted-foreground dark:border-zinc-700">
      {label}
    </p>
  );
}

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
                className="flex items-center gap-3 overflow-hidden rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
  const monto = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (monto === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(monto);
}
