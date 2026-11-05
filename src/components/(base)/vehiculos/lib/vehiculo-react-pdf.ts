"use client";

export function prefetchInvoicePdfLibs(): void {
  void import("./pdfjs-worker");
  void import("react-pdf");
  void import("../forms/CarPdfInlineViewer");
  void import("./vehiculo-invoice-pdf-client").then((mod) => {
    mod.prefetchInvoicePdfAssets();
  });
}
