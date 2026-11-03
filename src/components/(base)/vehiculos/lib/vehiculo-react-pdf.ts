"use client";

export function prefetchInvoicePdfLibs(): void {
  void import("../forms/CarPdfInlineViewer");
  void import("./vehiculo-invoice-pdf-client").then((mod) => {
    mod.prefetchInvoicePdfAssets();
  });
}
