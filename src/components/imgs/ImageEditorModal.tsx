"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { Check, RotateCw, Save, X } from "lucide";
import {
  ModalFooter,
  ModalShell,
} from "@/components/ui/general-modal";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import type { Area } from "./cropImage";
import { getCroppedFile } from "./cropImage";

export const PHOTO_CROP_ASPECT = 4 / 3;

interface ImageEditorModalProps {
  file: File;
  title?: string;
  hint?: string;
  aspectLabel?: string;
  aspect?: number;
  onApply: (croppedFile: File) => void | Promise<void>;
  onCancel: () => void;
}

export default function ImageEditorModal({
  file,
  title = "Recortar foto",
  hint = "Encuadra la foto para que se vea todo.",
  aspect = PHOTO_CROP_ASPECT,
  onApply,
  onCancel,
}: ImageEditorModalProps) {
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setApplying(true);
    try {
      const cropped = await getCroppedFile(
        imageSrc,
        croppedAreaPixels,
        rotation,
        file.name.replace(/\.[^.]+$/, ".jpg") || "foto.jpg",
        "image/jpeg",
      );
      await onApply(cropped);
    } catch (err) {
      console.error("Error al recortar:", err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <ModalShell
      open
      onClose={applying ? () => undefined : onCancel}
      title={title}
      maxWidth="max-w-2xl"
      className="md:h-auto md:max-h-[calc(100dvh-2rem)]"
      contentClassName="flex flex-col overflow-hidden bg-white p-4 dark:bg-zinc-900 md:p-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{hint}</p>
          <SigetActionButton
            label="Girar"
            accentColor={sigetAccent.editar}
            morphFrom={RotateCw}
            morphTo={RotateCw}
            morphOnHover={false}
            disabled={applying}
            className="w-auto shrink-0"
            onClick={() => setRotation((r) => r + 90)}
          />
        </div>

        <div className="relative w-full overflow-hidden rounded-[1.5rem] bg-zinc-100 aspect-[4/3] dark:bg-zinc-800">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              showGrid
              objectFit="cover"
              classes={{
                containerClassName: "photo-crop-container",
                cropAreaClassName: "photo-crop-area",
              }}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>
      </div>

      <ModalFooter>
        <SigetActionButton
          label="Cancelar"
          accentColor={sigetAccent.cancelar}
          morphFrom={X}
          morphTo={X}
          morphOnHover={false}
          disabled={applying}
          className="w-auto shrink-0"
          onClick={onCancel}
        />
        <SigetActionButton
          label="Usar"
          accentColor={sigetAccent.guardar}
          morphFrom={Save}
          morphTo={Check}
          disabled={applying || !croppedAreaPixels}
          className="w-auto shrink-0"
          onClick={() => void handleApply()}
        />
      </ModalFooter>
    </ModalShell>
  );
}
