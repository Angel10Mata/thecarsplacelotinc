import type { VehiculoListRow } from "./zod";

export type VehiculoFacturaPdfData = {
  logoSrc: string | null;
  invoiceNumber: string;
  invoiceDateDisplay: string;
  customerName: string;
  customerNit: string;
  customerAddress: string;
  carDescription: string;
  unitPrice: string;
  subTotal: string;
  total: string;
  terms: string;
  incoterms: string;
};

function formatInvoiceDateLegacy(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "America/Guatemala",
  });
}

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function formatInvoiceCustomerName(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "—";
  return trimmed.toLocaleUpperCase("es-GT");
}

export function buildVehiculoFacturaPdfData(
  row: VehiculoListRow,
  logoSrc: string,
): VehiculoFacturaPdfData {
  const modelo = row.modelo !== "—" ? row.modelo : "";
  const carLine = [row.marca, modelo].filter(Boolean).join(" ").trim();
  const vinPart = row.vin?.trim() ? ` VIN# ${row.vin.trim()}` : "";
  const total = row.total ?? row.precio ?? 0;
  const sub = row.subTotal ?? total;

  return {
    logoSrc,
    invoiceNumber: row.placa,
    invoiceDateDisplay: formatInvoiceDateLegacy(row.invoiceDate),
    customerName: formatInvoiceCustomerName(row.clienteNombre),
    customerNit: row.clienteNit?.trim() || "—",
    customerAddress: row.clienteDireccion?.trim() || "—",
    carDescription: `${carLine}${vinPart}`.trim() || row.placa,
    unitPrice: money(total),
    subTotal: money(sub),
    total: money(total),
    terms: row.terms?.trim() || "SOLD AS IS, NO WARRANTY",
    incoterms: row.incoterms?.trim() || "FOB",
  };
}

export function vehiculoFacturaPdfFileName(invoiceNumber: string): string {
  const safe = invoiceNumber.replace(/[^\w.-]+/g, "_").trim() || "factura";
  return `invoice-${safe}.pdf`;
}
