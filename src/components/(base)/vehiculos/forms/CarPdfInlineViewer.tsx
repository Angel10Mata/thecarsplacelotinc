"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLoadedReactPdf, loadReactPdf } from "../lib/vehiculo-react-pdf";

const ZOOM_MAX = 2.75;
const ZOOM_STEP = 0.25;
const MOBILE_CONTENT_INSET_PX = 16;
const NARROW_LAYOUT_MAX_PX = 768;

type ReactPdfModule = typeof import("react-pdf");

type CarPdfInlineViewerProps = {
  url: string;
  className?: string;
};

function clampZoom(value: number, min: number) {
  return Math.min(ZOOM_MAX, Math.max(min, Math.round(value * 100) / 100));
}

function computeFitZoom(
  contentWidth: number,
  contentHeight: number,
  pageAspectHeightOverWidth: number,
): number {
  if (contentWidth <= 0 || contentHeight <= 0 || pageAspectHeightOverWidth <= 0) {
    return 1;
  }
  const pageHeightAtFullWidth = contentWidth * pageAspectHeightOverWidth;
  const byHeight = (contentHeight * 0.92) / pageHeightAtFullWidth;
  return Math.min(1, byHeight);
}

export function CarPdfInlineViewer({ url, className }: CarPdfInlineViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const autoFitZoomRef = useRef(1);
  const zoomMinRef = useRef(1);
  const [pdfLib, setPdfLib] = useState<ReactPdfModule | null>(
    () => getLoadedReactPdf(),
  );
  const [baseWidth, setBaseWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pdfPageAspect, setPdfPageAspect] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const isNarrowLayout =
    baseWidth > 0 && baseWidth < NARROW_LAYOUT_MAX_PX;
  const contentWidth = isNarrowLayout
    ? Math.max(200, baseWidth - MOBILE_CONTENT_INSET_PX * 2)
    : Math.max(200, baseWidth);

  const applyAutoFitZoom = useCallback(() => {
    if (baseWidth <= 0 || containerHeight <= 0) return;
    if (!isNarrowLayout) {
      autoFitZoomRef.current = 1;
      zoomMinRef.current = 1;
      setZoom(1);
      return;
    }
    if (!pdfPageAspect) return;
    const fit = computeFitZoom(contentWidth, containerHeight, pdfPageAspect);
    autoFitZoomRef.current = fit;
    zoomMinRef.current = Math.min(0.35, fit);
    setZoom(fit);
  }, [
    baseWidth,
    containerHeight,
    contentWidth,
    isNarrowLayout,
    pdfPageAspect,
  ]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    let active = true;
    void loadReactPdf().then((mod) => {
      if (!active) return;
      setPdfLib(mod);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setZoom(1);
    autoFitZoomRef.current = 1;
    zoomMinRef.current = 1;
    setPdfPageAspect(null);
    setNumPages(0);
  }, [url]);

  useEffect(() => {
    applyAutoFitZoom();
  }, [applyAutoFitZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0) return;
      setBaseWidth(Math.round(w));
      if (h > 0) setContainerHeight(Math.round(h));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startDistance = 0;
    let startZoom = 1;

    const distance = (touches: TouchList) => {
      const a = touches.item(0);
      const b = touches.item(1);
      if (!a || !b) return 0;
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;
      startDistance = distance(event.touches);
      startZoom = zoomRef.current;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || startDistance <= 0) return;
      event.preventDefault();
      const next = startZoom * (distance(event.touches) / startDistance);
      setZoom(clampZoom(next, zoomMinRef.current));
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [pdfLib]);

  const pageWidth = Math.round(contentWidth * zoom);

  const zoomOut = () =>
    setZoom((z) => clampZoom(z - ZOOM_STEP, zoomMinRef.current));
  const zoomIn = () => setZoom((z) => clampZoom(z + ZOOM_STEP, zoomMinRef.current));
  const resetZoom = () => setZoom(autoFitZoomRef.current);

  const atDefaultZoom = Math.abs(zoom - autoFitZoomRef.current) < 0.02;

  if (!pdfLib) {
    return (
      <div
        className={cn(
          "flex min-h-[12rem] flex-1 items-center justify-center bg-zinc-100 dark:bg-zinc-900",
          className,
        )}
      >
        <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
      </div>
    );
  }

  const { Document, Page } = pdfLib;

  return (
    <div
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-900",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-center gap-2 border-b border-zinc-200/80 bg-zinc-100 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= zoomMinRef.current + 0.01}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-brand transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-brand-bright dark:hover:bg-zinc-700"
          aria-label="Reducir zoom"
        >
          <Minus className="size-4" strokeWidth={2.5} />
        </button>
        <span className="min-w-[3.25rem] text-center text-xs font-bold tabular-nums text-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX - 0.01}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-brand transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-brand-bright dark:hover:bg-zinc-700"
          aria-label="Ampliar zoom"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={resetZoom}
          disabled={atDefaultZoom}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-brand transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-brand-bright dark:hover:bg-zinc-700"
          aria-label="Restablecer zoom"
        >
          <RotateCcw className="size-3.5" strokeWidth={2.25} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex h-full min-h-0 w-full flex-1 flex-col overflow-auto overscroll-contain px-2 py-2 md:px-0 md:py-0"
      >
        {baseWidth <= 0 ? (
          <div className="flex min-h-[12rem] flex-1 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
          </div>
        ) : (
          <Document
            className="flex w-full min-w-0 flex-col items-center"
            file={url}
            loading={
              <div className="flex min-h-[12rem] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
              </div>
            }
            error={
              <p className="px-4 py-8 text-center text-sm font-semibold text-destructive">
                No se pudo mostrar el PDF.
              </p>
            }
            onLoadSuccess={({ numPages: total }) => setNumPages(total)}
          >
            {Array.from({ length: numPages }, (_, index) => (
              <Page
                key={`page-${index + 1}`}
                pageNumber={index + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={
                  index === 0
                    ? (page) => {
                        setPdfPageAspect(page.height / page.width);
                      }
                    : undefined
                }
                className={cn(
                  "mb-2 max-w-full overflow-hidden rounded-none bg-white last:mb-0",
                  "[&_.react-pdf__Page__canvas]:!mx-auto [&_.react-pdf__Page__canvas]:!block [&_.react-pdf__Page__canvas]:!max-w-full",
                  index === 0 && "mb-0",
                )}
              />
            ))}
          </Document>
        )}
      </div>
    </div>
  );
}
