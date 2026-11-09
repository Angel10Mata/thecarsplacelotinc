"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Crop, GripVertical, Loader2, Plus, X } from "lucide-react";
import { CarPdfInlineViewer } from "./CarPdfInlineViewer";
import { ModalConfirmDelete, toast } from "@/components/ui/general-modal";
import { cn } from "@/lib/utils";
import ImageEditorModal from "@/components/imgs/ImageEditorModal";
import { cropFileToCenteredAspect } from "@/components/imgs/cropImage";
import {
  reorderCarPhotoPaths,
  VEHICLE_PHOTO_ASPECT,
} from "../lib/vehiculo-galeria-items";
import {
  CAR_IMAGE_MAX_BYTES,
  CAR_PDF_MAX_BYTES,
  carInvoiceStoragePath,
  carStoragePathToPublicUrl,
  isCarPdfStoragePath,
  nextCarMediaStoragePath,
} from "../lib/car-images";
import { vehiculoFacturaPdfFileName } from "../lib/vehiculo-invoice-data";
import { compressCarPhotoForStorage } from "../lib/compress-car-photo";
import { carStorageErrorMessage } from "../lib/storage-messages";
import {
  removeCarImageStorageAction,
  uploadCarImageStorageAction,
} from "../lib/storage-actions";

const TILE_CLASS =
  "relative aspect-[4/3] w-[8.75rem] shrink-0 overflow-hidden rounded-2xl sm:w-36";

const ADD_TILE_BUTTON_CLASS = cn(
  TILE_CLASS,
  "flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-brand/25 bg-brand/5 text-brand transition-colors hover:border-brand/40 hover:bg-brand/10 disabled:opacity-60 dark:border-brand-bright/30 dark:bg-brand-bright/5 dark:text-brand-bright dark:hover:bg-brand-bright/10",
);

const PHOTOS_GRID_CLASS =
  "mx-auto grid w-fit grid-cols-2 gap-3 sm:grid-cols-4";

const PHOTOS_LIST_CLASS = "flex w-full flex-col gap-2.5";

const PHOTO_ROW_CLASS =
  "flex items-center gap-2.5 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-2 outline-none dark:border-zinc-700 dark:bg-zinc-800";

const PHOTO_THUMB_CLASS =
  "relative aspect-[4/3] h-20 w-auto shrink-0 overflow-hidden rounded-xl sm:h-24";

const ADD_LIST_BUTTON_CLASS = cn(
  "flex h-20 w-full shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand/25 bg-brand/5 text-brand transition-colors hover:border-brand/40 hover:bg-brand/10 disabled:opacity-60 sm:h-24 dark:border-brand-bright/30 dark:bg-brand-bright/5 dark:text-brand-bright dark:hover:bg-brand-bright/10",
);

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const PDF_MIME = "application/pdf";
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

function fileExtension(file: File): string {
  const name = file.name.replace(/^.*[/\\]/, "");
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function isPdfFile(file: File): boolean {
  return file.type === PDF_MIME || fileExtension(file) === "pdf";
}

function isImageFile(file: File): boolean {
  if (file.type === "image/jpg" || file.type === "image/pjpeg") return true;
  if (IMAGE_MIME.includes(file.type as (typeof IMAGE_MIME)[number])) return true;
  return IMAGE_EXT.has(fileExtension(file));
}

async function sniffMediaKind(file: File): Promise<"image" | "pdf" | null> {
  if (isPdfFile(file)) return "pdf";
  if (isImageFile(file)) return "image";
  try {
    const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
      return "image";
    }
    if (
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47
    ) {
      return "image";
    }
    if (
      buf.length >= 12 &&
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50
    ) {
      return "image";
    }
    if (
      buf.length >= 4 &&
      buf[0] === 0x25 &&
      buf[1] === 0x50 &&
      buf[2] === 0x44 &&
      buf[3] === 0x46
    ) {
      return "pdf";
    }
  } catch {
    /* ignore */
  }
  try {
    const bitmap = await createImageBitmap(file);
    bitmap.close();
    return "image";
  } catch {
    /* ignore */
  }
  const baseName = file.name.replace(/^.*[/\\]/, "").replace(/\.[^.]+$/, "");
  if (!fileExtension(file) || /^\d+$/.test(baseName)) return "image";
  return "image";
}

function fileForImageUpload(file: File): File {
  if (file.type.startsWith("image/")) return file;
  const name = fileExtension(file) ? file.name : `${file.name || "photo"}.jpg`;
  return new File([file], name, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

function galleryPublicSrc(path: string, epoch: number): string {
  const url = carStoragePathToPublicUrl(path);
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${epoch}`;
}

function photoFileNameFromPath(path: string): string {
  const name = path.split("/").pop()?.trim();
  return name && name.length > 0 ? name : "foto.jpg";
}

async function fileFromImageUrl(url: string, fileName: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("FETCH_IMAGE");
  const blob = await res.blob();
  return new File([blob], fileName, {
    type: blob.type || "image/jpeg",
    lastModified: Date.now(),
  });
}

export type VehiculoFotosGaleriaMode = "photos" | "factura";

type RemovePrompt = {
  index: number;
  kind: "photo" | "factura";
};

type VehiculoFotosGaleriaProps = {
  storageFolderId: string | null;
  paths: string[];
  onChange: (paths: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
  maxPhotos?: number;
  mode?: VehiculoFotosGaleriaMode;
  invoiceNumber?: string;
};

export function VehiculoFotosGaleria({
  storageFolderId,
  paths,
  onChange,
  onBusyChange,
  maxPhotos,
  mode = "photos",
  invoiceNumber = "",
}: VehiculoFotosGaleriaProps) {
  const [uploading, setUploading] = useState(false);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [activeDragPath, setActiveDragPath] = useState<string | null>(null);
  const [mediaEpoch, setMediaEpoch] = useState(() => Date.now());
  const [localTiles, setLocalTiles] = useState<
    { key: string; url: string; isPdf: boolean }[]
  >([]);
  const [recrop, setRecrop] = useState<{ file: File; path: string } | null>(
    null,
  );
  const [recropLoadingPath, setRecropLoadingPath] = useState<string | null>(
    null,
  );
  const [removePrompt, setRemovePrompt] = useState<RemovePrompt | null>(null);
  const [removePending, setRemovePending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const pathsRef = useRef(paths);
  const originalsRef = useRef(new Map<string, File>());
  const visibleEntries = useMemo(
    () =>
      paths
        .map((path, index) => ({ path, index }))
        .filter(({ path }) =>
          mode === "factura"
            ? isCarPdfStoragePath(path)
            : !isCarPdfStoragePath(path),
        ),
    [mode, paths],
  );
  const canAdd =
    maxPhotos === undefined || visibleEntries.length < maxPhotos;

  useEffect(() => {
    pathsRef.current = paths;
  }, [paths]);

  const principalImageIndex = useMemo(
    () => paths.findIndex((p) => !isCarPdfStoragePath(p)),
    [paths],
  );
  const galleryLocked =
    uploading ||
    recrop !== null ||
    recropLoadingPath !== null ||
    removePending;
  const photoIds = useMemo(
    () => visibleEntries.map((entry) => entry.path),
    [visibleEntries],
  );
  const canSortPhotos = photoIds.length > 1 && !galleryLocked;
  const sortSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleSortStart = (event: DragStartEvent) => {
    setActiveDragPath(String(event.active.id));
  };

  const handleSortEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragPath(null);
    if (!over) return;
    const next = reorderCarPhotoPaths(
      pathsRef.current,
      String(active.id),
      String(over.id),
    );
    if (next === pathsRef.current) return;
    pathsRef.current = next;
    onChange(next);
  };

  const acceptFiles = async (files: File[]) => {
    if (!storageFolderId) {
      toast.warn("Aún no hay carpeta de vehículo asignada.");
      return;
    }
    const classified = await Promise.all(
      files.map(async (file) => ({ file, kind: await sniffMediaKind(file) })),
    );
    const accepted = classified.filter((item) => {
      if (item.kind === null) return false;
      if (mode === "factura") return item.kind === "pdf";
      return item.kind === "image";
    });
    if (accepted.length === 0) {
      const sample = files[0]?.name?.trim();
      if (mode === "factura") {
        toast.warn(
          sample
            ? `«${sample}» no es una factura PDF.`
            : "En este paso solo se sube la factura en PDF (máx. 10 MB).",
        );
        return;
      }
      toast.warn(
        sample
          ? `No se pudo usar «${sample}». Usa JPG, PNG o WebP.`
          : "En este paso solo se suben fotografías (JPG, PNG o WebP).",
      );
      return;
    }

    const slotsLeft =
      maxPhotos === undefined
        ? accepted.length
        : Math.max(0, maxPhotos - visibleEntries.length);
    if (slotsLeft === 0) {
      toast.warn("Límite de archivos alcanzado.");
      return;
    }

    const batch = accepted.slice(0, slotsLeft);
    if (accepted.length > batch.length) {
      toast.warn(`Solo se añadirán ${batch.length} archivo${batch.length === 1 ? "" : "s"} (límite alcanzado).`);
    }

    const images = batch
      .filter((item) => item.kind === "image")
      .map((item) => fileForImageUpload(item.file));
    const pdfs = batch.filter((item) => item.kind === "pdf").map((item) => item.file);

    if (pdfs.length > 0) {
      const previews = pdfs.map((file, index) => ({
        key: `${file.name}-${file.lastModified}-${index}`,
        url: "",
        isPdf: true,
      }));
      setLocalTiles(previews);
      setUploading(true);
      let workingPaths = paths;
      let added = 0;
      try {
        for (const file of pdfs) {
          const next = await uploadPdfToPaths(file, workingPaths, storageFolderId);
          if (next) {
            workingPaths = next;
            added += 1;
          }
        }
        if (added > 0) {
          onChange(workingPaths);
          setMediaEpoch(Date.now());
        }
      } finally {
        setLocalTiles([]);
        setUploading(false);
      }
    }

    if (images.length > 0) {
      const previews = images.map((file, index) => ({
        key: `${file.name}-${file.lastModified}-${index}`,
        url: URL.createObjectURL(file),
        isPdf: false,
      }));
      setLocalTiles(previews);
      setUploading(true);
      let workingPaths = pathsRef.current;
      let added = 0;
      try {
        for (const file of images) {
          let cropped = file;
          try {
            cropped = await cropFileToCenteredAspect(file, VEHICLE_PHOTO_ASPECT);
          } catch (err) {
            console.error(err);
          }
          const next = await uploadImageToPaths(
            cropped,
            workingPaths,
            storageFolderId,
          );
          if (next) {
            const newPath = next[next.length - 1];
            if (newPath) {
              originalsRef.current.set(newPath, file);
            }
            workingPaths = next;
            added += 1;
          }
        }
        if (added > 0) {
          pathsRef.current = workingPaths;
          onChange(workingPaths);
          setMediaEpoch(Date.now());
        }
      } finally {
        previews.forEach((tile) => URL.revokeObjectURL(tile.url));
        setLocalTiles([]);
        setUploading(false);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (!canAdd || galleryLocked || !storageFolderId) return;
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    dragDepthRef.current += 1;
    setIsFileDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsFileDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canAdd || galleryLocked || !storageFolderId) return;
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsFileDragging(false);
    if (!canAdd || galleryLocked || !storageFolderId) return;
    const files = e.dataTransfer.files;
    if (!files?.length) return;
    void acceptFiles(Array.from(files));
  };

  useEffect(() => {
    onBusyChange?.(
      uploading || recrop !== null || recropLoadingPath !== null,
    );
  }, [uploading, recrop, recropLoadingPath, onBusyChange]);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (files.length === 0 || galleryLocked) return;
    void acceptFiles(files);
  };

  const handleAddClick = () => {
    if (galleryLocked || !storageFolderId) return;
    fileInputRef.current?.click();
  };

  const openRecrop = async (path: string) => {
    if (uploading || recrop || recropLoadingPath || removePrompt) return;
    const original = originalsRef.current.get(path);
    if (original) {
      setRecrop({ file: original, path });
      return;
    }
    setRecropLoadingPath(path);
    try {
      const file = await fileFromImageUrl(
        galleryPublicSrc(path, mediaEpoch),
        photoFileNameFromPath(path),
      );
      setRecrop({ file, path });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo abrir la foto para recortar.");
    } finally {
      setRecropLoadingPath(null);
    }
  };

  const handleRecropApply = async (cropped: File) => {
    if (!recrop) return;
    setUploading(true);
    try {
      const ok = await replaceImageAtPath(cropped, recrop.path);
      if (!ok) return;
      setMediaEpoch(Date.now());
      setRecrop(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRecropCancel = () => {
    if (uploading) return;
    setRecrop(null);
  };

  const uploadImageToPaths = async (
    sourceFile: File,
    currentPaths: string[],
    folderId: string,
  ): Promise<string[] | null> => {
    try {
      const jpegBlob = await compressCarPhotoForStorage(sourceFile);
      if (jpegBlob.size > CAR_IMAGE_MAX_BYTES) {
        const kb = Math.round(jpegBlob.size / 1024);
        toast.error(
          `La foto comprimida sigue siendo grande (${kb} KB). Máximo ${Math.round(CAR_IMAGE_MAX_BYTES / 1024)} KB en cars-images.`,
        );
        return null;
      }

      const newPath = nextCarMediaStoragePath(folderId, currentPaths, "jpg");
      const formData = new FormData();
      formData.append("file", jpegBlob);
      formData.append("path", newPath);

      let result = await uploadCarImageStorageAction(formData);
      if (!result.ok && result.code === "STORAGE_DUPLICATE") {
        formData.append("upsert", "true");
        result = await uploadCarImageStorageAction(formData);
      }
      if (!result.ok) {
        let msg = carStorageErrorMessage(
          result.code,
          "detail" in result ? result.detail : undefined,
        );
        if (result.code === "STORAGE_SIZE") {
          const kb = Math.round(jpegBlob.size / 1024);
          msg = `${msg} (archivo comprimido: ${kb} KB)`;
        }
        toast.error(msg);
        return null;
      }

      return [...currentPaths, result.path];
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error && err.message === "COMPRESS_FAILED"
          ? "No se pudo comprimir la imagen por debajo de 200 KB."
          : "Error al subir la imagen.";
      toast.error(msg);
      return null;
    }
  };

  const replaceImageAtPath = async (
    sourceFile: File,
    path: string,
  ): Promise<boolean> => {
    try {
      const jpegBlob = await compressCarPhotoForStorage(sourceFile);
      if (jpegBlob.size > CAR_IMAGE_MAX_BYTES) {
        const kb = Math.round(jpegBlob.size / 1024);
        toast.error(
          `La foto comprimida sigue siendo grande (${kb} KB). Máximo ${Math.round(CAR_IMAGE_MAX_BYTES / 1024)} KB en cars-images.`,
        );
        return false;
      }

      const formData = new FormData();
      formData.append("file", jpegBlob);
      formData.append("path", path);
      formData.append("upsert", "true");

      const result = await uploadCarImageStorageAction(formData);
      if (!result.ok) {
        let msg = carStorageErrorMessage(
          result.code,
          "detail" in result ? result.detail : undefined,
        );
        if (result.code === "STORAGE_SIZE") {
          const kb = Math.round(jpegBlob.size / 1024);
          msg = `${msg} (archivo comprimido: ${kb} KB)`;
        }
        toast.error(msg);
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error && err.message === "COMPRESS_FAILED"
          ? "No se pudo comprimir la imagen por debajo de 200 KB."
          : "Error al subir la imagen.";
      toast.error(msg);
      return false;
    }
  };

  const uploadPdfToPaths = async (
    sourceFile: File,
    currentPaths: string[],
    folderId: string,
  ): Promise<string[] | null> => {
    if (sourceFile.size > CAR_PDF_MAX_BYTES) {
      toast.warn("La factura no puede superar 10 MB.");
      return null;
    }
    try {
      const invoice = invoiceNumber.trim();
      if (!invoice) {
        toast.warn("Ingresa el número de factura antes de subir el PDF.");
        return null;
      }
      const fileName = vehiculoFacturaPdfFileName(invoice);
      const namedFile = new File([sourceFile], fileName, {
        type: "application/pdf",
        lastModified: sourceFile.lastModified,
      });
      const newPath = carInvoiceStoragePath(folderId, fileName);
      const previousPdfs = currentPaths.filter((path) => isCarPdfStoragePath(path));
      const formData = new FormData();
      formData.append("file", namedFile);
      formData.append("path", newPath);
      formData.append("upsert", "true");

      const result = await uploadCarImageStorageAction(formData);
      if (!result.ok) {
        let msg = carStorageErrorMessage(
          result.code,
          "detail" in result ? result.detail : undefined,
        );
        if (result.code === "STORAGE_SIZE") {
          const kb = Math.round(sourceFile.size / 1024);
          if (sourceFile.size > CAR_PDF_MAX_BYTES) {
            msg = `La factura supera 10 MB. Tamaño: ${kb} KB.`;
          } else {
            msg = `Supabase rechazó el PDF (${kb} KB). Los PDF van al bucket «Facturas» (10 MB), no a cars-images (200 KB). Ejecuta db/storage-cars.sql si faltan políticas en Facturas.`;
          }
        }
        toast.error(msg);
        return null;
      }

      const stalePdfs = previousPdfs.filter((path) => path !== result.path);
      await Promise.all(
        stalePdfs.map((path) => removeCarImageStorageAction(path)),
      );
      return [
        ...currentPaths.filter((path) => !isCarPdfStoragePath(path)),
        result.path,
      ];
    } catch (err) {
      console.error(err);
      toast.error("Error al subir la factura.");
      return null;
    }
  };

  const removeAt = async (index: number) => {
    const path = paths[index];
    if (!path) return;
    const result = await removeCarImageStorageAction(path);
    if (!result.ok) {
      toast.error(carStorageErrorMessage(result.code));
      return false;
    }
    originalsRef.current.delete(path);
    onChange(paths.filter((_, i) => i !== index));
    setMediaEpoch(Date.now());
    return true;
  };

  const requestRemoveAt = (index: number) => {
    if (uploading || removePending) return;
    setRemovePrompt({
      index,
      kind: mode === "factura" ? "factura" : "photo",
    });
  };

  const confirmRemove = async () => {
    if (!removePrompt) return;
    setRemovePending(true);
    try {
      const ok = await removeAt(removePrompt.index);
      if (ok) setRemovePrompt(null);
    } finally {
      setRemovePending(false);
    }
  };

  const facturaEntry = mode === "factura" ? visibleEntries[0] : undefined;
  const facturaViewerUrl = useMemo(
    () =>
      facturaEntry ? carStoragePathToPublicUrl(facturaEntry.path) : null,
    [facturaEntry],
  );
  const facturaViewerKey = facturaEntry
    ? `${facturaEntry.path}:${mediaEpoch}`
    : null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple={mode !== "factura"}
        accept={
          mode === "factura"
            ? "application/pdf,.pdf"
            : "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        }
        className="sr-only"
        onChange={handleFileSelected}
      />
      <div
        className={cn(
          "relative",
          mode === "factura"
            ? facturaEntry
              ? "flex min-h-0 w-full flex-1 flex-col overflow-hidden"
              : PHOTOS_GRID_CLASS
            : PHOTOS_LIST_CLASS,
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {mode === "factura" ? (
          facturaEntry && facturaViewerUrl && facturaViewerKey ? (
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700">
              <CarPdfInlineViewer
                key={facturaViewerKey}
                url={facturaViewerUrl}
                fullDocument
              />
              <button
                type="button"
                onClick={() => requestRemoveAt(facturaEntry.index)}
                disabled={uploading}
                className="absolute right-2.5 top-2.5 z-20 flex size-7 cursor-pointer items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm transition-colors hover:bg-red-200 disabled:opacity-50 dark:bg-red-950/80 dark:text-red-300 dark:hover:bg-red-900"
                aria-label="Quitar factura"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
              {uploading ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-zinc-900/70">
                  <Loader2 className="size-8 animate-spin text-brand dark:text-brand-bright" />
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading || !storageFolderId}
              onClick={handleAddClick}
              className={cn(
                ADD_TILE_BUTTON_CLASS,
                isFileDragging &&
                  storageFolderId &&
                  !uploading &&
                  "border-brand bg-brand/15 ring-2 ring-brand/30 dark:border-brand-bright dark:bg-brand-bright/15 dark:ring-brand-bright/30",
              )}
            >
              {uploading ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <>
                  <Plus size={28} strokeWidth={2.25} />
                  <span className="text-center text-[11px] font-black uppercase leading-tight tracking-wider">
                    {isFileDragging && storageFolderId ? "Soltar" : "Añadir"}
                  </span>
                </>
              )}
            </button>
          )
        ) : (
        <>
        <DndContext
          sensors={sortSensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleSortStart}
          onDragEnd={handleSortEnd}
          onDragCancel={() => setActiveDragPath(null)}
        >
          <SortableContext
            items={photoIds}
            strategy={verticalListSortingStrategy}
          >
            {visibleEntries.map(({ path, index }, visibleIndex) => {
              const publicUrl = galleryPublicSrc(path, mediaEpoch);
              const tileBusy =
                recropLoadingPath === path ||
                (uploading && recrop?.path === path);
              return (
                <SortablePhotoRow
                  key={path}
                  path={path}
                  publicUrl={publicUrl}
                  photoLabel={
                    visibleIndex === 0 ? "Principal" : `Foto ${visibleIndex + 1}`
                  }
                  busy={tileBusy}
                  locked={galleryLocked}
                  canSort={canSortPhotos}
                  onRecrop={() => void openRecrop(path)}
                  onRemove={() => requestRemoveAt(index)}
                />
              );
            })}
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeDragPath ? (
              <PhotoRowView
                publicUrl={galleryPublicSrc(activeDragPath, mediaEpoch)}
                photoLabel={
                  photoIds[0] === activeDragPath
                    ? "Principal"
                    : `Foto ${(photoIds.indexOf(activeDragPath) + 1) || 1}`
                }
                busy={false}
                locked
                canSort
                isOverlay
                onRecrop={() => undefined}
                onRemove={() => undefined}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
        {localTiles
          .filter((tile) => !tile.isPdf)
          .map((tile, localIndex) => (
            <div key={tile.key} className={PHOTO_ROW_CLASS}>
              <div className={cn(PHOTO_THUMB_CLASS, "bg-zinc-100 dark:bg-zinc-800")}>
                <img src={tile.url} alt="" className="size-full object-cover" />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                  <Loader2 size={22} className="animate-spin text-white" />
                </span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {principalImageIndex < 0 && localIndex === 0
                  ? "Principal"
                  : "Subiendo"}
              </span>
            </div>
          ))}

        {canAdd ? (
          <button
            type="button"
            disabled={galleryLocked || !storageFolderId}
            onClick={handleAddClick}
            className={cn(
              ADD_LIST_BUTTON_CLASS,
              isFileDragging &&
                canAdd &&
                storageFolderId &&
                !galleryLocked &&
                "border-brand bg-brand/15 ring-2 ring-brand/30 dark:border-brand-bright dark:bg-brand-bright/15 dark:ring-brand-bright/30",
            )}
          >
            {uploading ? (
              <Loader2 size={28} className="animate-spin" />
            ) : (
              <>
                <Plus size={28} strokeWidth={2.25} />
                <span className="text-center text-[11px] font-black uppercase leading-tight tracking-wider">
                  {isFileDragging && canAdd && storageFolderId
                    ? "Soltar"
                    : "Añadir"}
                </span>
              </>
            )}
          </button>
        ) : null}
        </>
        )}
      </div>
      {removePrompt && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto p-4">
              <div
                aria-hidden
                className="absolute inset-0 bg-black/40 dark:bg-black/55"
                onClick={() => {
                  if (!removePending) setRemovePrompt(null);
                }}
              />
              <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <ModalConfirmDelete
                  key={`${removePrompt.kind}-${removePrompt.index}`}
                  title={
                    removePrompt.kind === "factura"
                      ? "¿Eliminar factura?"
                      : "¿Eliminar fotografía?"
                  }
                  description={
                    removePrompt.kind === "factura"
                      ? "Se eliminará el PDF de la factura del vehículo. Tendrás que volver a subirlo si lo necesitas."
                      : "Se quitará esta imagen de la galería del vehículo."
                  }
                  warningText={null}
                  confirmDelaySec={7}
                  pending={removePending}
                  onCancel={() => {
                    if (!removePending) setRemovePrompt(null);
                  }}
                  onConfirm={() => void confirmRemove()}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
      {recrop ? (
        <ImageEditorModal
          file={recrop.file}
          aspect={VEHICLE_PHOTO_ASPECT}
          title="Recortar foto"
          hint="Encuadra la foto para que se vea todo."
          onApply={handleRecropApply}
          onCancel={handleRecropCancel}
        />
      ) : null}
    </>
  );
}

type PhotoRowViewProps = {
  publicUrl: string;
  photoLabel: string;
  busy: boolean;
  locked: boolean;
  canSort: boolean;
  isOverlay?: boolean;
  dragHandleProps?: React.ComponentProps<"button">;
  onRecrop: () => void;
  onRemove: () => void;
};

function PhotoRowView({
  publicUrl,
  photoLabel,
  busy,
  locked,
  canSort,
  isOverlay = false,
  dragHandleProps,
  onRecrop,
  onRemove,
}: PhotoRowViewProps) {
  return (
    <div
      className={cn(
        PHOTO_ROW_CLASS,
        isOverlay && "pointer-events-none shadow-lg ring-2 ring-brand/30",
      )}
    >
      <button
        type="button"
        {...dragHandleProps}
        disabled={!canSort || locked}
        className="flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-zinc-400 outline-none active:cursor-grabbing disabled:cursor-default disabled:opacity-30"
        aria-label="Ordenar fotografía"
      >
        <GripVertical size={18} strokeWidth={2.25} />
      </button>
      <button
        type="button"
        onClick={onRecrop}
        disabled={locked}
        className={cn(
          PHOTO_THUMB_CLASS,
          "group bg-zinc-100 dark:bg-zinc-800",
          locked ? "cursor-wait" : "cursor-pointer",
        )}
        aria-label="Recortar fotografía"
      >
        <img src={publicUrl} alt="" className="size-full object-cover" />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35 group-disabled:bg-transparent">
          <Crop
            size={22}
            strokeWidth={2.25}
            className="text-white opacity-0 transition-opacity group-hover:opacity-100 group-disabled:opacity-0"
          />
        </span>
        {busy ? (
          <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/25">
            <Loader2 size={22} className="animate-spin text-white" />
          </span>
        ) : null}
      </button>
      <span className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
        {photoLabel}
      </span>
      {isOverlay ? null : (
        <button
          type="button"
          onClick={onRemove}
          disabled={locked}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50 dark:bg-red-950/80 dark:text-red-300 dark:hover:bg-red-900"
          aria-label="Quitar foto"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

function SortablePhotoRow({
  path,
  ...props
}: PhotoRowViewProps & { path: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: path,
    disabled: !props.canSort || props.locked,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
        opacity: isDragging ? 0.35 : undefined,
      }}
    >
      <PhotoRowView
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export async function removeCarImageFromStorage(path: string | null) {
  if (!path || /^https?:\/\//i.test(path)) return;
  await removeCarImageStorageAction(path);
}
