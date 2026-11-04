import { carMediaPublicUrlIsPdf } from "./car-images";
import type { VehiculoListRow } from "./zod";

export const VEHICLE_PHOTO_ASPECT = 4 / 3;
export const vehiculoGaleriaMarcoFotoClass = "aspect-[4/3]";

export type VehiculoPhotoItem = { kind: "image"; url: string };

export type VehiculoInvoiceSource =
  | { kind: "uploaded-pdf"; url: string }
  | { kind: "generated-invoice" };

export function rowHasUploadedPdf(row: VehiculoListRow): boolean {
  if (row.hasUploadedPdf) return true;
  return row.imageUrls.some((url) => carMediaPublicUrlIsPdf(url));
}

function photoIndexFromPublicUrl(url: string): number {
  const segment = (url.split("?")[0] ?? url).split("/").pop() ?? "";
  const match = segment.match(/^(\d+)\.jpg$/i);
  return match ? Number(match[1]) : 0;
}

export function buildVehiculoPhotoItems(row: VehiculoListRow): VehiculoPhotoItem[] {
  const urls = row.imageUrls
    .filter((url) => !carMediaPublicUrlIsPdf(url))
    .sort((a, b) => photoIndexFromPublicUrl(a) - photoIndexFromPublicUrl(b));
  return urls.map((url) => ({ kind: "image" as const, url }));
}

export function resolveVehiculoInvoiceSource(
  row: VehiculoListRow,
): VehiculoInvoiceSource {
  const uploaded = row.imageUrls.find((url) => carMediaPublicUrlIsPdf(url));
  if (uploaded) {
    return { kind: "uploaded-pdf", url: uploaded };
  }
  return { kind: "generated-invoice" };
}
