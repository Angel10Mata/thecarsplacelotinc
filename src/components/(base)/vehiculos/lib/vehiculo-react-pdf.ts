"use client";

export function prefetchInvoicePdfLibs(): void {
  void import("./pdf-polyfill");
  void import("./pdfjs-setup").catch(() => undefined);
  void import("../forms/CarPdfInlineViewer").catch(() => undefined);
  void import("./vehiculo-invoice-pdf-client")
    .then((mod) => {
      mod.prefetchInvoicePdfAssets();
    })
    .catch(() => undefined);
}
