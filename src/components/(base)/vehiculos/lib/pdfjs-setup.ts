import "./pdf-polyfill";
import { Document, Page, pdfjs } from "react-pdf";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export { Document, Page };
