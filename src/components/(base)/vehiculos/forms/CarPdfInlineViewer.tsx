"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { ZoomIn, ZoomOut } from "lucide";
import { Loader2 } from "lucide-react";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import { cn } from "@/lib/utils";
import { Document, Page } from "../lib/pdfjs-setup";

type CarPdfInlineViewerProps = {
  url: string;
  className?: string;
  fullDocument?: boolean;
};

type NativePageSize = { width: number; height: number };

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const PAGE_PAD = 16;
const DEFAULT_PAGE_SIZE: NativePageSize = { width: 612, height: 792 };

class PdfErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { crashed: boolean }
> {
  state = { crashed: false };

  static getDerivedStateFromError(): { crashed: boolean } {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("invoice pdf viewer:", error, info.componentStack);
    this.props.onError();
  }

  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
}

function touchDistance(a: Touch, b: Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

const pdfViewerChromeClass =
  "bg-zinc-100 dark:bg-zinc-900";

function InvoiceLoadError() {
  return (
    <div
      className={cn(
        "flex min-h-[14rem] flex-1 items-center justify-center px-6 text-center text-sm font-semibold text-muted-foreground",
        pdfViewerChromeClass,
      )}
    >
      No se pudo mostrar la factura.
    </div>
  );
}


export function CarPdfInlineViewer({
  url,
  className,
  fullDocument = false,
}: CarPdfInlineViewerProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const lastTapRef = useRef(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [numPages, setNumPages] = useState(0);
  const [nativePage, setNativePage] = useState<NativePageSize>(DEFAULT_PAGE_SIZE);
  const [zoom, setZoom] = useState(1);
  const [renderZoom, setRenderZoom] = useState(1);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const timer = window.setTimeout(() => setRenderZoom(zoom), 70);
    return () => window.clearTimeout(timer);
  }, [zoom]);

  useEffect(() => {
    setNumPages(0);
    setNativePage(DEFAULT_PAGE_SIZE);
    setZoom(1);
    setRenderZoom(1);
    setLoadError(false);
  }, [url]);

  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;

    const syncSize = () => {
      const width = Math.floor(node.clientWidth);
      const height = Math.floor(node.clientHeight);
      if (width <= 0) return;
      setViewport((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height: height > 0 ? height : current.height },
      );
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [url]);

  useEffect(() => {
    if (!fullDocument) return;
    const node = scrollRef.current;
    if (!node) return;

    const applyZoom = (next: number) => {
      setZoom(clampZoom(next));
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2 && event.touches[0] && event.touches[1]) {
        pinchRef.current = {
          distance: touchDistance(event.touches[0], event.touches[1]),
          zoom: zoomRef.current,
        };
        return;
      }
      if (event.touches.length === 1) {
        const now = Date.now();
        if (now - lastTapRef.current < 280) {
          event.preventDefault();
          applyZoom(zoomRef.current > 1 ? 1 : 2);
          lastTapRef.current = 0;
          return;
        }
        lastTapRef.current = now;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      const pinch = pinchRef.current;
      if (!pinch || event.touches.length !== 2 || !event.touches[0] || !event.touches[1]) {
        return;
      }
      event.preventDefault();
      const distance = touchDistance(event.touches[0], event.touches[1]);
      if (pinch.distance <= 0) return;
      applyZoom(pinch.zoom * (distance / pinch.distance));
    };

    const onTouchEnd = () => {
      if (!pinchRef.current) return;
      pinchRef.current = null;
    };

    node.addEventListener("touchstart", onTouchStart, { passive: false });
    node.addEventListener("touchmove", onTouchMove, { passive: false });
    node.addEventListener("touchend", onTouchEnd);
    node.addEventListener("touchcancel", onTouchEnd);
    return () => {
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      node.removeEventListener("touchend", onTouchEnd);
      node.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [fullDocument, url]);

  const onDocumentLoadSuccess = useCallback(
    (doc: {
      numPages: number;
      getPage: (pageNumber: number) => Promise<{
        getViewport: (params: { scale: number }) => { width: number; height: number };
      }>;
    }) => {
      setNumPages(doc.numPages);
      void doc.getPage(1).then((page) => {
        const viewportSize = page.getViewport({ scale: 1 });
        if (viewportSize.width > 0 && viewportSize.height > 0) {
          setNativePage({
            width: viewportSize.width,
            height: viewportSize.height,
          });
        }
      });
    },
    [],
  );

  const availableWidth = Math.max(0, viewport.width - PAGE_PAD);
  const availableHeight = Math.max(240, (viewport.height || 480) - PAGE_PAD);
  const fitScale = fullDocument
    ? Math.min(
        availableWidth / nativePage.width,
        availableHeight / nativePage.height,
      )
    : availableWidth / nativePage.width;
  const pageWidth =
    viewport.width > 0 && Number.isFinite(fitScale) && fitScale > 0
      ? Math.max(1, Math.floor(nativePage.width * fitScale * renderZoom))
      : 0;

  const pageNumbers =
    fullDocument && numPages > 1
      ? Array.from({ length: numPages }, (_, i) => i + 1)
      : [1];

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden",
        pdfViewerChromeClass,
        className,
      )}
    >
      {loadError ? <InvoiceLoadError /> : null}

      <div
        ref={measureRef}
        className={cn(
          "relative min-h-0 flex-1",
          fullDocument ? "h-full" : "min-h-[28rem]",
        )}
      >
        <div
          ref={scrollRef}
          className={cn(
            "absolute inset-0 overflow-auto",
            pdfViewerChromeClass,
            fullDocument && "touch-none",
          )}
        >
          {url && pageWidth > 0 && !loadError ? (
            <PdfErrorBoundary onError={() => setLoadError(true)}>
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={() => setLoadError(true)}
                onSourceError={() => setLoadError(true)}
                loading={
                  <div
                    className={cn(
                      "flex min-h-[14rem] items-center justify-center",
                      pdfViewerChromeClass,
                    )}
                  >
                    <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
                  </div>
                }
                className={cn(
                  "flex min-h-full flex-col items-center py-2",
                  pdfViewerChromeClass,
                  renderZoom <= 1 ? "justify-center" : "justify-start",
                )}
              >
                {pageNumbers.map((pageNumber) => (
                  <Page
                    key={pageNumber}
                    pageNumber={pageNumber}
                    width={pageWidth}
                    devicePixelRatio={Math.min(
                      typeof window !== "undefined" ? window.devicePixelRatio : 1,
                      2,
                    )}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="bg-white shadow-sm [&_canvas]:block [&_canvas]:max-w-none dark:bg-white"
                  />
                ))}
              </Document>
            </PdfErrorBoundary>
          ) : null}
        </div>
      </div>

      {fullDocument && !loadError && pageWidth > 0 ? (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex gap-1.5">
          <div className="pointer-events-auto">
            <SigetActionButton
              iconOnly
              label="Menos"
              accentColor={sigetAccent.cancelar}
              morphFrom={ZoomOut}
              morphTo={ZoomOut}
              morphOnHover={false}
              disabled={zoom <= MIN_ZOOM}
              ariaLabel="Alejar factura"
              onClick={() => setZoom((value) => clampZoom(value * 0.9))}
            />
          </div>
          <div className="pointer-events-auto">
            <SigetActionButton
              iconOnly
              label="Más"
              accentColor={sigetAccent.abrir}
              morphFrom={ZoomIn}
              morphTo={ZoomIn}
              morphOnHover={false}
              disabled={zoom >= MAX_ZOOM}
              ariaLabel="Acercar factura"
              onClick={() => setZoom((value) => clampZoom(value * 1.1))}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
