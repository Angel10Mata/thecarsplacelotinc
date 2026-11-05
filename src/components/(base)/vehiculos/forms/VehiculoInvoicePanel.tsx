"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { VehiculoInvoiceSource } from "../lib/vehiculo-galeria-items";
import type { VehiculoListRow } from "../lib/zod";
import { CarGeneratedInvoiceViewer } from "./CarGeneratedInvoiceViewer";

const invoiceViewerClass = "h-full min-h-0 w-full min-w-0 flex-1";

const invoiceLoading = (
  <div className="flex min-h-[14rem] flex-1 items-center justify-center bg-white">
    <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
  </div>
);

const CarPdfInlineViewer = dynamic(
  () => import("./CarPdfInlineViewer").then((m) => m.CarPdfInlineViewer),
  { ssr: false, loading: () => invoiceLoading },
);

export function VehiculoInvoicePanel({
  invoiceSource,
  row,
}: {
  invoiceSource: VehiculoInvoiceSource;
  row: VehiculoListRow;
}) {
  if (invoiceSource.kind === "uploaded-pdf") {
    return (
      <CarPdfInlineViewer
        url={invoiceSource.url}
        className={invoiceViewerClass}
        fullDocument
      />
    );
  }

  return (
    <CarGeneratedInvoiceViewer row={row} className={invoiceViewerClass} />
  );
}
