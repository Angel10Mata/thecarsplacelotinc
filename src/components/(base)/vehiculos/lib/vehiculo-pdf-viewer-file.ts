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
  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const res = await fetch(trimmed, {
    mode: "cors",
    credentials: "omit",
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error("PDF_FETCH");
  }
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength < 4) {
    throw new Error("PDF_EMPTY_BODY");
  }
  return buffer;
}
