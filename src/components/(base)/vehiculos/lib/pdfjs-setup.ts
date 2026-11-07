"use client";

import "./pdf-polyfill";
import { Document, Page, pdfjs } from "react-pdf";

if (typeof window !== "undefined") {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  } catch {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
}

export { Document, Page };
