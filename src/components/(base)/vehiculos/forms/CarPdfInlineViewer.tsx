"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import "../lib/pdfjs-worker";

type CarPdfInlineViewerProps = {
  url: string;
  className?: string;
  fullDocument?: boolean;
};

async function loadPdfFile(url: string): Promise<ArrayBuffer | string> {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error("EMPTY_URL");
  }
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const res = await fetch(trimmed, { mode: "cors", credentials: "omit" });
  if (!res.ok) {
    throw new Error("FETCH");
  }
  return res.arrayBuffer();
}

export function CarPdfInlineViewer({
  url,
  className,
  fullDocument = false,
}: CarPdfInlineViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pdfFile, setPdfFile] = useState<ArrayBuffer | string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    setPdfFile(null);
    setNumPages(0);
    setLoadError(false);

    void loadPdfFile(url)
      .then((file) => {
        if (active) setPdfFile(file);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [url]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const syncWidth = () => {
      const next = Math.floor(node.clientWidth);
      if (next > 0) setPageWidth(next);
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [pdfFile]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages);
    },
    [],
  );

  const pageNumbers =
    fullDocument && numPages > 0
      ? Array.from({ length: numPages }, (_, i) => i + 1)
      : numPages > 0
        ? [1]
        : [];

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white",
        className,
      )}
    >
      {loadError ? (
        <div className="flex min-h-[14rem] flex-1 items-center justify-center px-6 text-center text-sm font-semibold text-muted-foreground">
          No se pudo mostrar la factura.
        </div>
      ) : !pdfFile || pageWidth <= 0 ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white",
          fullDocument ? "h-full" : "min-h-[28rem]",
        )}
      >
        {pdfFile && pageWidth > 0 ? (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setLoadError(true)}
            loading={
              <div className="flex min-h-[14rem] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
              </div>
            }
            className="flex flex-col items-center gap-2 py-2"
          >
            {pageNumbers.map((pageNumber) => (
              <Page
                key={pageNumber}
                pageNumber={pageNumber}
                width={pageWidth}
                devicePixelRatio={
                  typeof window !== "undefined" ? window.devicePixelRatio : 1
                }
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-sm"
              />
            ))}
          </Document>
        ) : null}
      </div>
    </div>
  );
}
