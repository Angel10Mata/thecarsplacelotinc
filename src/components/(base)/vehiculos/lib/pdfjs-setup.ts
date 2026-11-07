"use client";

import "./pdf-polyfill";

export type ReactPdfModule = typeof import("react-pdf");

let reactPdfPromise: Promise<ReactPdfModule> | null = null;

function configurePdfWorker(pdfjs: ReactPdfModule["pdfjs"]): void {
  if (typeof window === "undefined") return;
  const version = pdfjs.version;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
}

export function loadReactPdf(): Promise<ReactPdfModule> {
  if (!reactPdfPromise) {
    reactPdfPromise = import("react-pdf").then((mod) => {
      configurePdfWorker(mod.pdfjs);
      return mod;
    });
  }
  return reactPdfPromise;
}
