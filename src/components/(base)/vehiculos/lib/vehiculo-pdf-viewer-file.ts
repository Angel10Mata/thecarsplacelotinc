"use client";

import { createClient } from "@/utils/supabase/client";
import { carMediaStorageBucketForPath } from "./car-images";

function supabasePublicObjectFromUrl(
  url: string,
): { bucket: string; path: string } | null {
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  const rest = url.slice(idx + marker.length).split("?")[0] ?? "";
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  const bucket = decodeURIComponent(rest.slice(0, slash));
  const path = decodeURIComponent(rest.slice(slash + 1));
  if (!bucket || !path) return null;
  return { bucket, path };
}

async function downloadFromSupabaseStorage(
  source: string,
): Promise<Blob | null> {
  const parsed =
    supabasePublicObjectFromUrl(source) ??
    (!/^https?:\/\//i.test(source)
      ? {
          bucket: carMediaStorageBucketForPath(source),
          path: source.replace(/^\//, ""),
        }
      : null);
  if (!parsed) return null;

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .download(parsed.path);
  if (error || !data || data.size < 4) return null;
  return data;
}

export function pdfViewerStorageKey(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "";
  const withoutQuery = trimmed.split("?")[0] ?? trimmed;
  if (/^https?:\/\//i.test(withoutQuery)) {
    try {
      const u = new URL(withoutQuery);
      return u.pathname;
    } catch {
      return withoutQuery;
    }
  }
  return withoutQuery;
}

export async function resolvePdfFileForViewer(
  source: string,
): Promise<string | ArrayBuffer | Blob> {
  const trimmed = source.trim();
  if (!trimmed) {
    throw new Error("PDF_EMPTY");
  }
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const fromStorage = await downloadFromSupabaseStorage(trimmed);
  if (fromStorage) return fromStorage;

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  try {
    const res = await fetch(trimmed, {
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength >= 4) return buffer;
    }
  } catch {
    /* el visor puede cargar la URL directa */
  }

  return trimmed;
}
