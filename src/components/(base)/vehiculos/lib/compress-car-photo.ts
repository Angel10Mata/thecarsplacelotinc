import { CAR_IMAGE_MAX_BYTES } from "./car-images";

const TARGET_MAX_BYTES = CAR_IMAGE_MAX_BYTES - 8 * 1024;

const MAX_DIMENSIONS = [1400, 1200, 1024, 800, 640, 480, 360] as const;

function jpegFileName(source: File): string {
  const base = source.name.replace(/\.[^.]+$/, "").trim();
  return `${base || "photo"}.jpg`;
}

async function loadImageSource(file: File): Promise<HTMLImageElement | ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fallback */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("IMAGE_LOAD"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function releaseImageSource(source: HTMLImageElement | ImageBitmap): void {
  if (source instanceof ImageBitmap) {
    source.close();
  }
}

function sourceDimensions(source: HTMLImageElement | ImageBitmap): { w: number; h: number } {
  if (source instanceof HTMLImageElement) {
    return { w: source.naturalWidth, h: source.naturalHeight };
  }
  return { w: source.width, h: source.height };
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

async function encodeJpegUnderTarget(
  source: HTMLImageElement | ImageBitmap,
  targetBytes: number,
): Promise<Blob> {
  const { w: srcW, h: srcH } = sourceDimensions(source);
  if (srcW < 1 || srcH < 1) {
    throw new Error("INVALID_IMAGE");
  }

  let smallest: Blob | null = null;

  for (const maxDim of MAX_DIMENSIONS) {
    const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("CANVAS");
    ctx.drawImage(source, 0, 0, w, h);

    for (let q = 0.82; q >= 0.22; q -= 0.05) {
      const blob = await canvasToJpegBlob(canvas, q);
      if (!blob) continue;
      if (!smallest || blob.size < smallest.size) {
        smallest = blob;
      }
      if (blob.size <= targetBytes) {
        return blob;
      }
    }
  }

  if (smallest) return smallest;
  throw new Error("COMPRESS_FAILED");
}

export async function compressCarPhotoForStorage(source: File): Promise<File> {
  const loaded = await loadImageSource(source);
  try {
    const blob = await encodeJpegUnderTarget(loaded, TARGET_MAX_BYTES);
    return new File([blob], jpegFileName(source), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    releaseImageSource(loaded);
  }
}
