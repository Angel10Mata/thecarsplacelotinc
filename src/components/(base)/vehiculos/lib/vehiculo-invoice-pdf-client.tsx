"use client";

import {
  buildVehiculoFacturaPdfData,
  vehiculoFacturaPdfFileName,
} from "./vehiculo-invoice-data";
import type { VehiculoListRow } from "./zod";

let logoDataUrlPromise: Promise<string | null> | null = null;

const blobCache = new Map<string, Blob>();
const blobPromiseCache = new Map<string, Promise<Blob>>();
const blobUrlCache = new Map<string, string>();

export function invoiceRenderCacheKey(row: VehiculoListRow): string {
  return [
    row.id,
    row.placa,
    row.invoiceDate,
    row.clienteNombre ?? "",
    row.clienteNit ?? "",
    row.clienteDireccion ?? "",
    row.marca,
    row.modelo,
    row.vin ?? "",
    row.total,
    row.subTotal,
    row.terms,
    row.incoterms ?? "",
    "uc-name",
  ].join("|");
}

async function logoSrcForPdf(): Promise<string | null> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = (async () => {
      try {
        const res = await fetch("/logo.png", { cache: "force-cache" });
        if (!res.ok) return null;
        const blob = await res.blob();
        if (blob.size < 8) return null;
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("LOGO"));
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    })();
  }
  return logoDataUrlPromise;
}

export function prefetchInvoicePdfAssets(): void {
  void logoSrcForPdf();
  void import("@react-pdf/renderer");
  void import("./VehiculoFacturaPdfDocument");
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

async function getGeneratedInvoiceBlob(row: VehiculoListRow): Promise<Blob> {
  const key = invoiceRenderCacheKey(row);
  const cached = blobCache.get(key);
  if (cached) return cached;

  let pending = blobPromiseCache.get(key);
  if (!pending) {
    pending = renderInvoiceBlob(row).then((blob) => {
      blobCache.set(key, blob);
      blobPromiseCache.delete(key);
      return blob;
    });
    blobPromiseCache.set(key, pending);
  }
  return pending;
}

export function prefetchGeneratedInvoicePdf(row: VehiculoListRow): void {
  void getGeneratedInvoiceBlob(row);
}

export async function getGeneratedInvoiceBlobUrl(
  row: VehiculoListRow,
): Promise<string> {
  const key = invoiceRenderCacheKey(row);
  const cachedUrl = blobUrlCache.get(key);
  if (cachedUrl) return cachedUrl;

  const blob = await getGeneratedInvoiceBlob(row);
  const existing = blobUrlCache.get(key);
  if (existing) return existing;

  const url = URL.createObjectURL(blob);
  blobUrlCache.set(key, url);
  return url;
}

export async function downloadGeneratedInvoicePdf(row: VehiculoListRow) {
  const blob = await getGeneratedInvoiceBlob(row);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = vehiculoFacturaPdfFileName(row.placa);
  a.click();
  URL.revokeObjectURL(url);
}

/** @deprecated Usar getGeneratedInvoiceBlobUrl */
export async function createGeneratedInvoiceBlobUrl(
  row: VehiculoListRow,
): Promise<string> {
  return getGeneratedInvoiceBlobUrl(row);
}
