"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, FileText, Images, X } from "lucide-react";
import { Download as DownloadNode } from "lucide";
import { ModalShell, modalAccentClass, toast } from "@/components/ui/general-modal";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import { cn } from "@/lib/utils";
import {
  buildVehiculoPhotoItems,
  resolveVehiculoInvoiceSource,
  vehiculoGaleriaMarcoFotoClass,
  type VehiculoInvoiceSource,
} from "../lib/vehiculo-galeria-items";
import { vehiculoFacturaPdfFileName } from "../lib/vehiculo-invoice-data";
import { prefetchInvoicePdfLibs } from "../lib/vehiculo-react-pdf";
import { vehiculosTablaAddOutlineButtonClass } from "../lib/tabla-vehiculos-ui";
import { mapCarToListRow } from "../lib/helpers";
import { useCarForEdit } from "../lib/hooks";
import type { VehiculoListRow } from "../lib/zod";
import { VehiculoInvoicePanel } from "./VehiculoInvoicePanel";

const galeriaMediaPanelInvoiceClass =
  "relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900";

const galeriaPhotosStageClass =
  "relative flex min-h-0 max-h-full flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950 md:max-h-full md:flex-row";

const galeriaPhotosMainClass =
  "relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden p-4 max-md:min-h-[14rem]";

const galeriaPhotosMainFrameClass =
  "relative h-full max-h-full w-full max-w-full overflow-hidden rounded-2xl bg-zinc-900 md:w-auto";

const galeriaPhotosThumbRailClass =
  "custom-scrollbar flex h-24 w-full shrink-0 flex-row gap-2 overflow-x-auto border-t border-zinc-200/80 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950 md:h-full md:max-h-full md:min-h-0 md:w-32 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:border-l md:border-t-0";

const galeriaViewFadeTransition = {
  duration: 0.38,
  ease: [0.16, 1, 0.3, 1] as const,
};

const galeriaToggleFooterClass =
  "flex shrink-0 justify-center border-t border-zinc-200/80 px-4 py-4 dark:border-zinc-700 md:px-6";

function formatInvoiceDateEn(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Guatemala",
    })
    .toUpperCase()
    .replace(",", "");
}

function formatPrecio(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function tituloVehiculo(row: VehiculoListRow): string {
  const modelo = row.modelo !== "—" ? row.modelo : "";
  return [row.marca, modelo].filter(Boolean).join(" ").trim() || row.placa;
}

type VehiculoGaleriaViewerModalProps = {
  row: VehiculoListRow | null;
  onClose: () => void;
};

function InvoiceDownloadButton({
  row,
  invoiceSource,
}: {
  row: VehiculoListRow;
  invoiceSource: VehiculoInvoiceSource;
}) {
  const [downloading, setDownloading] = useState(false);

  return (
    <SigetActionButton
      label="Descargar"
      accentColor={sigetAccent.excel}
      morphFrom={DownloadNode}
      morphTo={DownloadNode}
      morphOnHover={false}
      disabled={downloading}
      className="w-auto shrink-0"
      onClick={() => {
        setDownloading(true);
        if (invoiceSource.kind === "uploaded-pdf") {
          const a = document.createElement("a");
          a.href = invoiceSource.url;
          a.download = vehiculoFacturaPdfFileName(row.placa);
          a.rel = "noopener";
          a.target = "_blank";
          a.click();
          setDownloading(false);
          return;
        }
        void import("../lib/vehiculo-invoice-pdf-client")
          .then((m) => m.downloadGeneratedInvoicePdf(row))
          .catch(() => toast.error("No se pudo descargar la factura."))
          .finally(() => setDownloading(false));
      }}
    />
  );
}

export function VehiculoGaleriaViewerModal({
  row,
  onClose,
}: VehiculoGaleriaViewerModalProps) {
  const [selected, setSelected] = useState(0);
  const [viewMode, setViewMode] = useState<"photos" | "invoice">("photos");

  const open = Boolean(row);
  const carId = row?.id ?? null;
  const { data: editData } = useCarForEdit(carId, open);

  const displayRow = useMemo((): VehiculoListRow | null => {
    if (!row) return null;
    if (editData) {
      return mapCarToListRow(editData.car, editData.customer);
    }
    return row;
  }, [row, editData]);

  const photoItems = useMemo(
    () => (displayRow ? buildVehiculoPhotoItems(displayRow) : []),
    [displayRow],
  );
  const invoiceSource = useMemo(
    () => (displayRow ? resolveVehiculoInvoiceSource(displayRow) : null),
    [displayRow],
  );

  useEffect(() => {
    setSelected(0);
    setViewMode("photos");
  }, [row?.id]);

  useEffect(() => {
    if (!displayRow) return;
    prefetchInvoicePdfLibs();
    if (invoiceSource?.kind !== "generated-invoice") return;
    void import("../lib/vehiculo-invoice-pdf-client").then((mod) => {
      mod.prefetchGeneratedInvoicePdf(displayRow);
    });
  }, [displayRow, invoiceSource?.kind]);

  useEffect(() => {
    if (selected >= photoItems.length) {
      setSelected(Math.max(0, photoItems.length - 1));
    }
  }, [photoItems.length, selected]);

  const activePhoto = photoItems[selected] ?? photoItems[0] ?? null;

  const copyVin = async () => {
    const vin = displayRow?.vin?.trim();
    if (!vin) return;
    try {
      await navigator.clipboard.writeText(vin);
      toast.success("VIN copiado.");
    } catch {
      toast.error("No se pudo copiar el VIN.");
    }
  };
  const invoiceSourceResolved =
    invoiceSource ?? (displayRow ? resolveVehiculoInvoiceSource(displayRow) : null);

  if (!displayRow || !invoiceSourceResolved) return null;

  const precio = formatPrecio(displayRow.precio);
  const titulo = tituloVehiculo(displayRow);
  const estado = displayRow.estado?.trim().toUpperCase();
  const showingPhotos = viewMode === "photos";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title=""
      hideCloseButton
      fullHeight
      maxWidth="max-w-5xl"
      className="md:!h-[90vh] md:!max-h-[90vh] md:overflow-hidden"
      frameClassName="md:!max-h-[90vh] md:!h-[90vh] min-h-0 overflow-hidden"
      headerClassName="hidden"
      contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0 md:p-0"
    >
      <div className="flex h-full min-h-0 max-h-full flex-col overflow-hidden">
        <div className="relative shrink-0 border-b border-zinc-200/80 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <motion.div
            className="flex flex-col gap-1 px-4 py-3 md:px-6 md:py-4"
            initial={false}
            animate={{ opacity: showingPhotos ? 1 : 0 }}
            transition={galeriaViewFadeTransition}
            style={{
              pointerEvents: showingPhotos ? "auto" : "none",
              visibility: showingPhotos ? "visible" : "hidden",
            }}
            aria-hidden={!showingPhotos}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                {estado ? (
                  <span
                    className={cn(
                      "text-[10px] font-black italic uppercase tracking-wide md:text-[11px]",
                      estado === "AVAILABLE"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {estado}
                  </span>
                ) : null}
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 md:text-[11px]">
                  {formatInvoiceDateEn(displayRow.invoiceDate)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Cerrar"
              >
                <X className="size-5" strokeWidth={2.25} />
              </button>
            </div>

            <h2 className="flex min-w-0 flex-col items-start gap-1 text-sm font-black italic uppercase leading-snug tracking-tight text-foreground md:flex-row md:flex-wrap md:items-baseline md:gap-x-2 md:text-xl md:leading-none">
              <span className="break-words">{titulo}</span>
              {precio ? (
                <span className="font-black italic text-foreground">{precio}</span>
              ) : null}
            </h2>

            {displayRow.vin ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 md:text-xs">
                  VIN: {displayRow.vin}
                </span>
                <button
                  type="button"
                  onClick={() => void copyVin()}
                  className="inline-flex cursor-pointer p-0.5 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                  aria-label="Copiar VIN"
                >
                  <Copy className="size-3.5" strokeWidth={2.25} />
                </button>
              </div>
            ) : null}
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-between gap-3 px-4 md:px-6"
            initial={false}
            animate={{ opacity: showingPhotos ? 0 : 1 }}
            transition={galeriaViewFadeTransition}
            style={{
              pointerEvents: showingPhotos ? "none" : "auto",
              visibility: showingPhotos ? "hidden" : "visible",
            }}
            aria-hidden={showingPhotos}
          >
            <p
              className={cn(
                "min-w-0 truncate text-sm font-black uppercase tracking-tight md:text-base",
                modalAccentClass,
              )}
            >
              Preview
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <InvoiceDownloadButton row={displayRow} invoiceSource={invoiceSourceResolved} />
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Cerrar"
              >
                <X className="size-5" strokeWidth={2.25} />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <motion.div
            className="absolute inset-0 z-0 flex min-h-0 flex-col"
            initial={false}
            animate={{ opacity: showingPhotos ? 1 : 0 }}
            transition={galeriaViewFadeTransition}
            style={{
              pointerEvents: showingPhotos ? "auto" : "none",
              visibility: showingPhotos ? "visible" : "hidden",
            }}
            aria-hidden={!showingPhotos}
          >
            <div className={cn(galeriaPhotosStageClass, "h-full min-h-0 flex-1")}>
              <div className={galeriaPhotosMainClass}>
                {activePhoto ? (
                  <div
                    className={cn(
                      galeriaPhotosMainFrameClass,
                      vehiculoGaleriaMarcoFotoClass,
                    )}
                  >
                    <img
                      key={activePhoto.url}
                      src={activePhoto.url}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="flex h-full min-h-[14rem] items-center justify-center px-6 text-center text-sm font-semibold text-muted-foreground">
                    Sin fotografías. Usa Invoice para ver la factura.
                  </p>
                )}
              </div>

              {photoItems.length > 0 ? (
                <div className={galeriaPhotosThumbRailClass}>
                  {photoItems.map((item, index) => (
                    <button
                      key={`${item.url}-${index}`}
                      type="button"
                      onClick={() => setSelected(index)}
                      className={cn(
                        "relative aspect-[4/3] h-full shrink-0 overflow-hidden rounded-xl border-2 transition-[border-color,opacity] md:h-auto md:w-full",
                        selected === index
                          ? "border-brand opacity-100 dark:border-brand-bright"
                          : "border-transparent opacity-40 hover:opacity-100 dark:opacity-30",
                      )}
                    >
                      <img
                        src={item.url}
                        alt=""
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 z-0 flex min-h-0 flex-col p-2 md:p-3"
            initial={false}
            animate={{ opacity: showingPhotos ? 0 : 1 }}
            transition={galeriaViewFadeTransition}
            style={{
              pointerEvents: showingPhotos ? "none" : "auto",
              visibility: showingPhotos ? "hidden" : "visible",
            }}
            aria-hidden={showingPhotos}
          >
            <div className={cn(galeriaMediaPanelInvoiceClass, "h-full min-h-0")}>
              <VehiculoInvoicePanel invoiceSource={invoiceSourceResolved} row={displayRow} />
            </div>
          </motion.div>
        </div>

        <div className={galeriaToggleFooterClass}>
          <button
            type="button"
            onClick={() => setViewMode(showingPhotos ? "invoice" : "photos")}
            className={cn(
              vehiculosTablaAddOutlineButtonClass,
              "w-auto max-lg:w-auto",
            )}
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
    </ModalShell>
  );
}
