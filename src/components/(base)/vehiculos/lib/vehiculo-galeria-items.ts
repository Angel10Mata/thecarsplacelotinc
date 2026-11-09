import { carMediaPublicUrlIsPdf, isCarPdfStoragePath } from "./car-images";
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

export function buildVehiculoPhotoItems(row: VehiculoListRow): VehiculoPhotoItem[] {
  return row.imageUrls
    .filter((url) => !carMediaPublicUrlIsPdf(url))
    .map((url) => ({ kind: "image" as const, url }));
}

export function reorderCarPhotoPaths(
  paths: string[],
  activePath: string,
  overPath: string,
): string[] {
  if (activePath === overPath) return paths;
  const photos: string[] = [];
  const pdfs: string[] = [];
  for (const path of paths) {
    if (isCarPdfStoragePath(path)) pdfs.push(path);
    else photos.push(path);
  }
  const from = photos.indexOf(activePath);
  const to = photos.indexOf(overPath);
  if (from < 0 || to < 0) return paths;
  const nextPhotos = [...photos];
  const [moved] = nextPhotos.splice(from, 1);
  if (!moved) return paths;
  nextPhotos.splice(to, 0, moved);
  return [...nextPhotos, ...pdfs];
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
