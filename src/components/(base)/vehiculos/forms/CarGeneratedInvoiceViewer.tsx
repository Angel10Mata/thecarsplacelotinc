"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getGeneratedInvoiceBlobUrl,
  invoiceRenderCacheKey,
} from "../lib/vehiculo-invoice-pdf-client";
import type { VehiculoListRow } from "../lib/zod";

const invoiceLoading = (
  <div className="flex min-h-[14rem] flex-1 items-center justify-center bg-white">
    <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
  </div>
);

const CarPdfInlineViewer = dynamic(
  () =>
    import("./CarPdfInlineViewer")
      .then((m) => m.CarPdfInlineViewer)
      .catch(() => function InvoiceViewerFallback() {
        return (
          <div className="flex min-h-[14rem] flex-1 items-center justify-center px-6 text-center text-sm font-semibold text-muted-foreground">
            No se pudo mostrar la factura.
          </div>
        );
      }),
  { ssr: false, loading: () => invoiceLoading },
);

type CarGeneratedInvoiceViewerProps = {
  row: VehiculoListRow;
  className?: string;
};

export function CarGeneratedInvoiceViewer({
  row,
  className,
}: CarGeneratedInvoiceViewerProps) {
  const cacheKey = useMemo(() => invoiceRenderCacheKey(row), [row]);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setBlobUrl(null);
    setError(false);

    void getGeneratedInvoiceBlobUrl(row)
      .then((url) => {
        if (!active) return;
        setBlobUrl(url);
      })
      .catch((err) => {
        console.error("generated invoice pdf:", err);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [cacheKey, row]);

  if (error) {
    return (
      <div className="flex min-h-[14rem] flex-1 items-center justify-center bg-white px-6 text-center text-sm font-semibold text-muted-foreground">
        No se pudo cargar la factura.
      </div>
    );
  }

  if (!blobUrl) {
    return invoiceLoading;
  }

  return <CarPdfInlineViewer url={blobUrl} className={className} fullDocument />;
}
