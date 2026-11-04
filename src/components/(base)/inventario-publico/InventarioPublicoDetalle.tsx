"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, FileText, Images, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { lockPageScroll } from "@/components/ui/general-modal";
import {
  resolveVehiculoInvoiceSource,
  vehiculoGaleriaMarcoFotoClass,
} from "@/components/(base)/vehiculos/lib/vehiculo-galeria-items";
import { prefetchInvoicePdfLibs } from "@/components/(base)/vehiculos/lib/vehiculo-react-pdf";
import { VehiculoInvoicePanel } from "@/components/(base)/vehiculos/forms/VehiculoInvoicePanel";
import { vehiculosTablaAddOutlineButtonClass } from "@/components/(base)/vehiculos/lib/tabla-vehiculos-ui";
import type { VehiculoListRow } from "@/components/(base)/vehiculos/lib/zod";
import type { PublicInventoryItem } from "./lib/zod";

const inventarioDetalleToggleFooterClass =
  "flex shrink-0 justify-center border-t border-zinc-200/80 px-4 py-4 dark:border-zinc-700 md:px-6";

const inventarioDetalleToggleBtnClass = cn(
  vehiculosTablaAddOutlineButtonClass,
  "w-auto max-lg:w-auto",
);

const inventarioDetalleInvoicePanelClass =
  "relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900";

const overlayFadeTransition = {
  duration: 0.38,
  ease: [0.16, 1, 0.3, 1] as const,
};

const panelEnterTransition = {
  duration: 0.44,
  ease: [0.16, 1, 0.3, 1] as const,
  delay: 0.03,
};

const viewFadeTransition = {
  duration: 0.38,
  ease: [0.16, 1, 0.3, 1] as const,
};

type InventarioPublicoDetalleProps = {
  item: PublicInventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
};

export function InventarioPublicoDetalle({
  item,
  isOpen,
  onClose,
}: InventarioPublicoDetalleProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"photos" | "invoice">("photos");

  const invoiceRow = item?.invoiceRow as VehiculoListRow | undefined;
  const invoiceSource = useMemo(
    () => (invoiceRow ? resolveVehiculoInvoiceSource(invoiceRow) : null),
    [invoiceRow],
  );
  const itemId = item?.id ?? null;

  useEffect(() => {
    if (!isOpen) return;
    return lockPageScroll();
  }, [isOpen]);

  useEffect(() => {
    setActiveImage(0);
    setIsImageLoading(true);
    setViewMode("photos");
  }, [itemId]);

  useEffect(() => {
    setIsImageLoading(true);
  }, [activeImage]);

  useEffect(() => {
    if (!isOpen || !invoiceRow) return;
    prefetchInvoicePdfLibs();
    if (invoiceSource?.kind !== "generated-invoice") return;
    void import("@/components/(base)/vehiculos/lib/vehiculo-invoice-pdf-client").then(
      (mod) => {
        mod.prefetchGeneratedInvoicePdf(invoiceRow);
      },
    );
  }, [isOpen, itemId, invoiceRow, invoiceSource?.kind]);

  if (!item || !invoiceSource || typeof document === "undefined") {
    return null;
  }

  const images = item.imageUrls.length > 0 ? item.imageUrls : [];
  const activeSrc = images[activeImage];
  const showingPhotos = viewMode === "photos";
  const statusAvailable = item.status === "AVAILABLE";

  const copyVin = () => {
    if (!item.vin) return;
    void navigator.clipboard.writeText(item.vin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="inventario-detalle-blur"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayFadeTransition}
            className="pointer-events-none fixed inset-0 z-[109] backdrop-blur-xl"
          />
          <motion.button
            key="inventario-detalle-scrim"
            type="button"
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayFadeTransition}
            className="fixed inset-0 z-[110] cursor-default bg-black/40 dark:bg-black/80"
            onClick={onClose}
          />
          <motion.div
            key="inventario-detalle-panel"
            initial={{ opacity: 0, y: 10, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.992 }}
            transition={panelEnterTransition}
            className="fixed inset-0 z-[111] flex items-center justify-center overflow-hidden overscroll-none p-0 sm:p-4"
          >
            <div
              className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-none border-y border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-black sm:rounded-lg sm:border"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-[100] rounded-full border border-black/10 bg-black/5 p-2 text-black backdrop-blur-md hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:right-6 sm:top-6"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>

        <div className="flex shrink-0 flex-col gap-2 border-b border-black/5 bg-gradient-to-b from-black/[0.01] to-transparent p-6 dark:border-white/5 dark:from-white/[0.03] sm:p-8">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-black uppercase border",
                statusAvailable
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "border-red-500/20 bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
              )}
            >
              {item.status}
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-black/40 dark:text-white/60">
              {item.invoiceDateLabel}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-4">
              <h2 className="text-lg font-black uppercase italic leading-none tracking-tighter text-black dark:text-white sm:text-xl">
                {item.title}
              </h2>
              <p className="font-mono text-lg font-black tracking-tighter text-primary sm:text-xl">
                {item.priceLabel}
              </p>
            </div>
            {item.vin ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold uppercase tracking-wider text-black/40 dark:text-white/40 sm:text-lg">
                  VIN: {item.vin}
                </span>
                <button
                  type="button"
                  onClick={copyVin}
                  className="p-1 transition-opacity hover:opacity-70"
                  aria-label="Copiar VIN"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4 text-black/40 dark:text-white/40" />
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <motion.div
            className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-black sm:flex-row"
            initial={false}
            animate={{ opacity: showingPhotos ? 1 : 0 }}
            transition={viewFadeTransition}
            style={{ pointerEvents: showingPhotos ? "auto" : "none" }}
            aria-hidden={!showingPhotos}
          >
            <div className="relative flex h-full w-full flex-1 items-center justify-center p-4">
              {activeSrc ? (
                <div
                  className={cn(
                    "relative h-full max-h-full w-auto max-w-full overflow-hidden rounded-2xl bg-zinc-900",
                    vehiculoGaleriaMarcoFotoClass,
                  )}
                >
                  <Image
                    key={`${item.id}-${activeImage}`}
                    src={activeSrc}
                    alt={item.title}
                    fill
                    className={cn(
                      "object-cover transition-[opacity,transform] duration-500 ease-out",
                      isImageLoading
                        ? "scale-[0.98] opacity-0"
                        : "scale-100 opacity-100",
                    )}
                    sizes="(max-width: 768px) 100vw, 80vw"
                    priority
                    onLoad={() => setIsImageLoading(false)}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-muted-foreground">
                  Sin fotografías
                </div>
              )}
            </div>

            {images.length > 1 ? (
              <div className="flex h-24 w-full shrink-0 gap-2 overflow-x-auto border-t border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.01] sm:h-full sm:w-24 sm:flex-col sm:overflow-y-auto sm:border-l sm:border-t-0">
                {images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative aspect-[4/3] h-full shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-auto sm:w-full",
                      activeImage === idx
                        ? "scale-105 border-primary"
                        : "border-transparent opacity-40 hover:opacity-100 dark:opacity-30",
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="96px" />
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>

          <motion.div
            className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 p-4 dark:bg-black sm:p-6"
            initial={false}
            animate={{ opacity: showingPhotos ? 0 : 1 }}
            transition={viewFadeTransition}
            style={{ pointerEvents: showingPhotos ? "none" : "auto" }}
            aria-hidden={showingPhotos}
          >
            <div className={inventarioDetalleInvoicePanelClass}>
              {invoiceRow ? (
                <VehiculoInvoicePanel invoiceSource={invoiceSource} row={invoiceRow} />
              ) : null}
            </div>
          </motion.div>
        </div>

        <div className={inventarioDetalleToggleFooterClass}>
          <button
            type="button"
            onClick={() => setViewMode(showingPhotos ? "invoice" : "photos")}
            className={inventarioDetalleToggleBtnClass}
          >
            {showingPhotos ? (
              <>
                <FileText className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                Invoice
              </>
            ) : (
              <>
                <Images className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                Fotos
              </>
            )}
          </button>
        </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
