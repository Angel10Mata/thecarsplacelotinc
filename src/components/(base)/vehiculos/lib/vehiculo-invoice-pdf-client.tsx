"use client";

import {
  buildVehiculoFacturaPdfData,
  vehiculoFacturaPdfFileName,
} from "./vehiculo-invoice-data";
import type { VehiculoListRow } from "./zod";

async function logoSrcForPdf(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png", { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size < 8) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("LOGO"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function renderInvoiceBlob(row: VehiculoListRow): Promise<Blob> {
  const [{ pdf }, { VehiculoFacturaPdfDocument }, logoSrc] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./VehiculoFacturaPdfDocument"),
    logoSrcForPdf(),
  ]);
  const data = buildVehiculoFacturaPdfData(row, logoSrc ?? "");
  return pdf(<VehiculoFacturaPdfDocument data={data} />).toBlob();
}

export async function downloadGeneratedInvoicePdf(row: VehiculoListRow) {
  const blob = await renderInvoiceBlob(row);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = vehiculoFacturaPdfFileName(row.placa);
  a.click();
  URL.revokeObjectURL(url);
}

export async function createGeneratedInvoiceBlobUrl(
  row: VehiculoListRow,
): Promise<string> {
  const blob = await renderInvoiceBlob(row);
  return URL.createObjectURL(blob);
}
