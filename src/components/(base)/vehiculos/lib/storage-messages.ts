import {
  MENSAJE_ERROR_SISTEMA,
  MENSAJE_ERROR_SUBIR_ARCHIVO,
} from "@/lib/mensajes-usuario";

export function classifyStorageError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("row-level security") || m.includes("violates policy")) {
    return "STORAGE_RLS" as const;
  }
  if (m.includes("bucket not found") || m.includes("bucket_id")) {
    return "STORAGE_BUCKET" as const;
  }
  if (m.includes("already exists") || m.includes("duplicate")) {
    return "STORAGE_DUPLICATE" as const;
  }
  if (
    m.includes("maximum allowed size") ||
    m.includes("payload too large") ||
    m.includes("file size limit")
  ) {
    return "STORAGE_SIZE" as const;
  }
  return "STORAGE_ERROR" as const;
}

export function carStorageErrorMessage(
  code: string,
  _detail?: string | null,
): string {
  if (code === "STORAGE_RLS") {
    return "No tienes permiso para subir archivos.";
  }
  if (code === "STORAGE_BUCKET") {
    return MENSAJE_ERROR_SISTEMA;
  }
  if (code === "STORAGE_DUPLICATE") {
    return "Ya existe un archivo en esa ubicación. Quita una imagen o elige otra carpeta.";
  }
  if (code === "STORAGE_SIZE") {
    return "El archivo es demasiado grande. Reduce el tamaño e intenta de nuevo.";
  }
  if (code === "UNAUTHORIZED") {
    return "Inicia sesión para subir imágenes.";
  }
  if (code === "VALIDATION") {
    return "Datos de imagen no válidos. Revisa el formulario e intenta de nuevo.";
  }
  if (code === "SERVICE_ROLE_CONFIG") {
    return MENSAJE_ERROR_SISTEMA;
  }
  return MENSAJE_ERROR_SUBIR_ARCHIVO;
}
