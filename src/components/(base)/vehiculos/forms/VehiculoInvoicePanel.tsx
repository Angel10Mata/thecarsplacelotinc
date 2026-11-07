"use client";

import type { VehiculoInvoiceSource } from "../lib/vehiculo-galeria-items";
import type { VehiculoListRow } from "../lib/zod";
import { CarGeneratedInvoiceViewer } from "./CarGeneratedInvoiceViewer";
import { CarPdfInlineViewer } from "./CarPdfInlineViewer";

const invoiceViewerClass = "h-full min-h-0 w-full min-w-0 flex-1";

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
