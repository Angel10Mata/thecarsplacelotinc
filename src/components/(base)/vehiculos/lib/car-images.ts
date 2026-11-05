export const CARS_IMAGE_BUCKET = "cars-images";
export const CARS_INVOICE_BUCKET = "Facturas";

export const CAR_IMAGE_MAX_BYTES = 200 * 1024;
export const CAR_PDF_MAX_BYTES = 10 * 1024 * 1024;

const CAR_IMAGE_PATH_RE = /^([^/]+)\/(\d+)\.jpg$/i;
const CAR_PDF_PATH_RE = /^([^/]+)\/[^/]+\.pdf$/i;
const CAR_LEGACY_MEDIA_PATH_RE = /^([^/]+)\/(\d+)\.(jpg|pdf)$/i;

const PUBLIC_BUCKET_MARKERS = [
  CARS_IMAGE_BUCKET,
  CARS_INVOICE_BUCKET,
] as const;

export function carMediaStorageBucketForPath(path: string): string {
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    for (const bucket of PUBLIC_BUCKET_MARKERS) {
      const marker = `/storage/v1/object/public/${bucket}/`;
      if (trimmed.includes(marker)) return bucket;
    }
  }
  if (trimmed.endsWith(".pdf")) return CARS_INVOICE_BUCKET;
  return CARS_IMAGE_BUCKET;
}

function storagePathFromRaw(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (CAR_IMAGE_PATH_RE.test(trimmed) || CAR_PDF_PATH_RE.test(trimmed)) {
    return trimmed;
  }
  for (const bucket of PUBLIC_BUCKET_MARKERS) {
    const publicMarker = `/storage/v1/object/public/${bucket}/`;
    const markerIdx = trimmed.indexOf(publicMarker);
    if (markerIdx >= 0) {
      return decodeURIComponent(
        trimmed.slice(markerIdx + publicMarker.length).split("?")[0] ?? "",
      );
    }
  }
  return trimmed;
}

function parseCarMediaStoragePath(
  raw: string,
): { folder: string; index: number; ext: "jpg" | "pdf" } | null {
  const path = storagePathFromRaw(raw);
  if (!path) return null;

  const imageMatch = path.match(CAR_IMAGE_PATH_RE);
  if (imageMatch?.[1] && imageMatch[2]) {
    return { folder: imageMatch[1], index: Number(imageMatch[2]), ext: "jpg" };
  }

  const legacy = path.match(CAR_LEGACY_MEDIA_PATH_RE);
  if (legacy?.[1] && legacy[2] && legacy[3]?.toLowerCase() === "pdf") {
    return { folder: legacy[1], index: Number(legacy[2]), ext: "pdf" };
  }

  const pdfMatch = path.match(CAR_PDF_PATH_RE);
  if (pdfMatch?.[1]) {
    return { folder: pdfMatch[1], index: 0, ext: "pdf" };
  }
  return null;
}

export function normalizeCarFolderId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("/")) return null;
  return trimmed;
}

export function isCarPdfStoragePath(path: string): boolean {
  const resolved = storagePathFromRaw(path);
  return CAR_PDF_PATH_RE.test(resolved) || /\.pdf$/i.test(resolved.split("?")[0] ?? "");
}

export function isValidCarMediaStoragePath(path: string): boolean {
  const trimmed = path.trim();
  return CAR_IMAGE_PATH_RE.test(trimmed) || CAR_PDF_PATH_RE.test(trimmed);
}

/** @deprecated Usar isValidCarMediaStoragePath */
export function isValidCarImageStoragePath(path: string): boolean {
  return /^(\d+)\/(\d+)\.jpg$/.test(path.trim());
}

export function nextCarMediaStoragePath(
  folderId: string,
  existingPaths: string[],
  ext: "jpg" | "pdf",
): string {
  const folder = normalizeCarFolderId(folderId);
  if (!folder) {
    throw new Error("INVALID_FOLDER");
  }
  let maxIndex = 0;
  for (const raw of existingPaths) {
    const parsed = parseCarMediaStoragePath(raw);
    if (parsed?.folder === folder) {
      maxIndex = Math.max(maxIndex, parsed.index);
    }
  }
  return `${folder}/${maxIndex + 1}.${ext}`;
}

export function nextCarImageStoragePath(
  folderId: string,
  existingPaths: string[],
): string {
  return nextCarMediaStoragePath(folderId, existingPaths, "jpg");
}

export function carInvoiceStoragePath(
  folderId: string,
  fileName: string,
): string {
  const folder = normalizeCarFolderId(folderId);
  if (!folder) {
    throw new Error("INVALID_FOLDER");
  }
  return `${folder}/${fileName}`;
}

export function carStoragePathToPublicUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return trimmed;
  const bucket = carMediaStorageBucketForPath(trimmed);
  const encoded = trimmed
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

export function carImagePathToPublicUrl(path: string): string {
  return carStoragePathToPublicUrl(path);
}

export function carMediaPublicUrlIsPdf(url: string): boolean {
  const path = url.split("?")[0] ?? url;
  return /\.pdf$/i.test(path);
}
