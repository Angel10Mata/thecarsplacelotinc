"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  type IconNode,
} from "lucide";
import { normalizarFechaCalendario } from "@/lib/fechas-gt";
import {
  ModalShell,
  ModalLoadingBody,
  ModalForm,
  ModalField,
  ModalLabel,
  ModalInput,
  ModalTextarea,
  ModalFechaCalendario,
  ModalFooter,
  ModalCancelButton,
  ModalSubmit,
  toast,
  modalActionMessage,
} from "@/components/ui/general-modal";
import {
  VehiculoActionError,
  vehiculoActionErrorMessage,
} from "../lib/action-errors";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import { cn } from "@/lib/utils";
import { useActualizarCar, useCarForEdit } from "../lib/hooks";
import { verificarFacturaDuplicadaAction } from "../lib/actions";
import {
  buildCarStorageFolderName,
  carStorageFolderFromMarcaModeloInput,
  DEFAULT_CAR_INCOTERMS,
  DEFAULT_CAR_STATUS,
  DEFAULT_CAR_TERMS,
  folderFromCarMediaStoragePath,
  formatMarcaModeloDisplay,
  parseMarcaModeloInput,
} from "../lib/helpers";
import { isCarPdfStoragePath } from "../lib/car-images";
import { loadReactPdf } from "../lib/pdfjs-setup";
import { BuscarClienteField } from "./BuscarClienteField";
import {
  removeCarImageFromStorage,
  VehiculoFotosGaleria,
} from "./VehiculoFotosGaleria";
import type { CustomerRow } from "@/components/(base)/clientes/lib/zod";
import {
  VEHICULOS_WIZARD_STEPS,
  vehiculosWizardFacturaStepClass,
  vehiculosWizardFooterActionsClass,
  vehiculosWizardFooterButtonClass,
  vehiculosWizardFormClass,
  vehiculosWizardModalContentClass,
  vehiculosWizardStepBodyClass,
  vehiculosWizardStepCaption,
} from "../lib/vehiculos-wizard-ui";
import {
  contarFotosVehiculoWizard,
  erroresVehiculosWizardStep1,
  MENSAJE_TOAST_FALTA_FACTURA,
  MENSAJE_TOAST_FALTA_FOTOS,
  mensajeToastCamposWizardStep1,
  quitarErrorCampoWizardStep1,
  vehiculosWizardStep1TieneErrores,
  vehiculosWizardTieneFacturaPdf,
  type VehiculosWizardStep1Errores,
} from "../lib/vehiculos-wizard-validacion";

type EditarVehiculoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string | null;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand dark:text-brand-bright">
      {children}
    </p>
  );
}

function WizardProgress({ step }: { step: number }) {
  return (
    <div className="shrink-0 space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Paso {step} de {VEHICULOS_WIZARD_STEPS} ·{" "}
        {vehiculosWizardStepCaption(step)}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: VEHICULOS_WIZARD_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i + 1 <= step ? "bg-brand dark:bg-brand-bright" : "bg-zinc-200 dark:bg-zinc-700",
            )}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

export default function EditarVehiculoModal({
  open,
  onOpenChange,
  carId,
}: EditarVehiculoModalProps) {
  const actualizar = useActualizarCar();
  const { data, isLoading, isError } = useCarForEdit(carId, open);
  const initialImagePathsRef = useRef<string[]>([]);
  const [hydratedId, setHydratedId] = useState<string | null>(null);
  const [hasSignedReceipt, setHasSignedReceipt] = useState(false);
  const [step, setStep] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(
    null,
  );
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [marcaModelo, setMarcaModelo] = useState("");
  const [carVin, setCarVin] = useState("");
  const [carStatus, setCarStatus] = useState(DEFAULT_CAR_STATUS);
  const [carPrice, setCarPrice] = useState("");
  const [carImagePaths, setCarImagePaths] = useState<string[]>([]);
  const [carStorageFolderId, setCarStorageFolderId] = useState<string | null>(
    null,
  );
  const [imagesBusy, setImagesBusy] = useState(false);
  const [total, setTotal] = useState("");
  const [terms, setTerms] = useState(DEFAULT_CAR_TERMS);
  const [incoterms, setIncoterms] = useState(DEFAULT_CAR_INCOTERMS);
  const [step1Errores, setStep1Errores] = useState<VehiculosWizardStep1Errores>(
    {},
  );
  const [validandoFactura, setValidandoFactura] = useState(false);

  useEffect(() => {
    if (!open || step < 2) return;
    void loadReactPdf();
  }, [open, step]);

  useEffect(() => {
    if (!open || !data || !carId || hydratedId === carId) return;
    const { car, customer } = data;
    setHasSignedReceipt(car.has_signed_receipt);
    setCustomerSearch("");
    setSelectedCustomer(customer);
    setInvoiceNumber(car.invoice_number);
    setInvoiceDate(normalizarFechaCalendario(car.invoice_date));
    setMarcaModelo(formatMarcaModeloDisplay(car.car_title, car.car_model));
    setCarVin(car.car_vin?.trim() ?? "");
    setCarStatus(car.car_status?.trim() || DEFAULT_CAR_STATUS);
    const precio = car.car_price ?? car.total;
    setCarPrice(precio !== null ? String(precio) : "");
    setTotal(String(car.total));
    setTerms(car.terms);
    setIncoterms(car.incoterms?.trim() || DEFAULT_CAR_INCOTERMS);
    const images = [...car.car_images];
    initialImagePathsRef.current = images;
    setCarImagePaths(images);
    const storedFolder = car.car_id?.trim();
    const folderFromImages = images[0]
      ? folderFromCarMediaStoragePath(images[0])
      : null;
    setCarStorageFolderId(
      storedFolder ||
        folderFromImages ||
        buildCarStorageFolderName(car.car_title, car.car_model),
    );
    setStep(1);
    setStep1Errores({});
    setHydratedId(carId);
  }, [open, data, carId, hydratedId]);

  useEffect(() => {
    if (!open) {
      setHydratedId(null);
      setStep(1);
    }
  }, [open]);

  useEffect(() => {
    if (open && isError) {
      toast.error(modalActionMessage("NOT_FOUND", "No se pudo cargar el vehículo."));
      onOpenChange(false);
    }
  }, [open, isError, onOpenChange]);

  const discardNewImages = () => {
    const initial = new Set(initialImagePathsRef.current);
    carImagePaths.forEach((path) => {
      if (!initial.has(path)) void removeCarImageFromStorage(path);
    });
  };

  const handleClose = () => {
    if (actualizar.isPending) return;
    discardNewImages();
    onOpenChange(false);
  };

  const pending = actualizar.isPending || validandoFactura;
  const ready = hydratedId === carId && !!carId;

  const setPrecioTotal = (value: string) => {
    setCarPrice(value);
    setTotal(value);
    setStep1Errores((prev) => quitarErrorCampoWizardStep1(prev, "total"));
  };

  const inputWizardStep1 = () => ({
    invoiceNumber,
    invoiceDate,
    carVin,
    marcaModelo,
    total,
    terms,
  });

  const notificarStep1SiFalta = () => {
    const errores = erroresVehiculosWizardStep1(inputWizardStep1());
    setStep1Errores(errores);
    if (!vehiculosWizardStep1TieneErrores(errores)) return true;
    toast.warn(mensajeToastCamposWizardStep1(errores));
    return false;
  };

  const goNext = async () => {
    if (!notificarStep1SiFalta()) return;
    const numero = invoiceNumber.trim();
    setValidandoFactura(true);
    try {
      const dup = await verificarFacturaDuplicadaAction(numero, carId);
      if (!dup.ok) {
        toast.error(
          modalActionMessage(
            dup.code,
            "No se pudo verificar el número de factura.",
          ),
        );
        return;
      }
      if (dup.exists) {
        toast.error(
          vehiculoActionErrorMessage(
            "DUPLICATE_INVOICE",
            "Ese número de factura ya fue ingresado.",
            dup.detail,
          ),
        );
        setStep1Errores((prev) => ({ ...prev, invoiceNumber: true }));
        return;
      }
    } finally {
      setValidandoFactura(false);
    }
    const folderFromMarca = carStorageFolderFromMarcaModeloInput(marcaModelo)!;
    if (carImagePaths.length > 0) {
      const folderFromPaths = folderFromCarMediaStoragePath(carImagePaths[0] ?? "");
      setCarStorageFolderId(folderFromPaths ?? folderFromMarca);
    } else {
      setCarStorageFolderId(folderFromMarca);
    }
    setStep(2);
  };

  const goToFactura = () => {
    if (!carStorageFolderId) {
      setStep1Errores((prev) => ({ ...prev, marcaModelo: true }));
      setStep(1);
      toast.warn("Revisa marca / modelo en el paso 1.");
      return;
    }
    if (contarFotosVehiculoWizard(carImagePaths) === 0) {
      toast.warn(MENSAJE_TOAST_FALTA_FOTOS);
      return;
    }
    setStep(3);
  };

  const hasFacturaPdf = useMemo(
    () => carImagePaths.some((path) => isCarPdfStoragePath(path)),
    [carImagePaths],
  );

  return (
    <ModalShell
      open={open && !!carId}
      onClose={handleClose}
      title="Editar vehículo"
      maxWidth="max-w-3xl"
      contentClassName={vehiculosWizardModalContentClass}
    >
      {isLoading || !ready ? (
        <ModalLoadingBody minHeightClass="min-h-[min(42rem,calc(100dvh-10rem))]" />
      ) : (
        <ModalForm
          className={vehiculosWizardFormClass}
          onSubmit={async (e) => {
            e.preventDefault();
            if (step !== VEHICULOS_WIZARD_STEPS || !carId) return;
            if (!notificarStep1SiFalta()) {
              setStep(1);
              return;
            }
            if (contarFotosVehiculoWizard(carImagePaths) === 0) {
              toast.warn(MENSAJE_TOAST_FALTA_FOTOS);
              setStep(2);
              return;
            }
            if (!vehiculosWizardTieneFacturaPdf(carImagePaths)) {
              toast.warn(MENSAJE_TOAST_FALTA_FACTURA);
              return;
            }
            try {
              const { car_title, car_model } = parseMarcaModeloInput(marcaModelo);
              await actualizar.mutateAsync({
                id: carId,
                invoice_number: invoiceNumber,
                invoice_date: invoiceDate,
                has_signed_receipt: hasSignedReceipt,
                customer_id: selectedCustomer?.id,
                car_id: carStorageFolderId ?? undefined,
                car_title,
                car_model: car_model || undefined,
                car_vin: carVin || undefined,
                car_status: carStatus.trim() || DEFAULT_CAR_STATUS,
                car_price: carPrice ? Number(carPrice) : undefined,
                car_image_urls: carImagePaths,
                sub_total: Number(carPrice) || Number(total) || 0,
                total: Number(total) || 0,
                terms,
                incoterms: incoterms || undefined,
              });
              toast.success("Vehículo actualizado.");
              initialImagePathsRef.current = [...carImagePaths];
              onOpenChange(false);
            } catch (err) {
              if (err instanceof VehiculoActionError) {
                const fallback = "No se pudo actualizar el vehículo.";
                const specific = vehiculoActionErrorMessage(
                  err.message,
                  fallback,
                  err.detail,
                );
                toast.error(
                  specific !== fallback && err.message.startsWith("DUPLICATE")
                    ? specific
                    : modalActionMessage(err.message, fallback),
                );
                return;
              }
              const code = err instanceof Error ? err.message : "DB_ERROR";
              toast.error(
                modalActionMessage(code, "No se pudo actualizar el vehículo."),
              );
            }
          }}
        >
          <WizardProgress step={step} />

          {step === 1 ? (
            <div className={vehiculosWizardStepBodyClass}>
              <SectionTitle>Factura</SectionTitle>
              <BuscarClienteField
                query={customerSearch}
                selected={selectedCustomer}
                onQueryChange={setCustomerSearch}
                onSelect={setSelectedCustomer}
                onClearSelection={() => setSelectedCustomer(null)}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ModalField>
                  <ModalLabel>Número de factura</ModalLabel>
                  <ModalInput
                    value={invoiceNumber}
                    invalid={Boolean(step1Errores.invoiceNumber)}
                    onChange={(e) => {
                      setInvoiceNumber(e.target.value);
                      setStep1Errores((prev) =>
                        quitarErrorCampoWizardStep1(prev, "invoiceNumber"),
                      );
                    }}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>Fecha de factura</ModalLabel>
                  <ModalFechaCalendario
                    value={invoiceDate}
                    invalid={Boolean(step1Errores.invoiceDate)}
                    onChange={(value) => {
                      setInvoiceDate(value);
                      setStep1Errores((prev) =>
                        quitarErrorCampoWizardStep1(prev, "invoiceDate"),
                      );
                    }}
                  />
                </ModalField>
              </div>

              <SectionTitle>Vehículo</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ModalField>
                  <ModalLabel>VIN</ModalLabel>
                  <ModalInput
                    value={carVin}
                    invalid={Boolean(step1Errores.carVin)}
                    onChange={(e) => {
                      setCarVin(e.target.value);
                      setStep1Errores((prev) =>
                        quitarErrorCampoWizardStep1(prev, "carVin"),
                      );
                    }}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>Marca / Modelo</ModalLabel>
                  <ModalInput
                    value={marcaModelo}
                    invalid={Boolean(step1Errores.marcaModelo)}
                    onChange={(e) => {
                      setMarcaModelo(e.target.value);
                      setStep1Errores((prev) =>
                        quitarErrorCampoWizardStep1(prev, "marcaModelo"),
                      );
                    }}
                    placeholder="Marca / Modelo"
                  />
                </ModalField>
              </div>
              <ModalField className="sm:max-w-[50%]">
                <ModalLabel>Estado</ModalLabel>
                <ModalInput
                  value={carStatus}
                  onChange={(e) => setCarStatus(e.target.value)}
                  placeholder={DEFAULT_CAR_STATUS}
                />
              </ModalField>

              <SectionTitle>Totales y términos</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ModalField>
                  <ModalLabel>Precio</ModalLabel>
                  <ModalInput
                    type="number"
                    min={0}
                    step="0.01"
                    value={carPrice}
                    invalid={Boolean(step1Errores.total)}
                    onChange={(e) => setPrecioTotal(e.target.value)}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>Total</ModalLabel>
                  <ModalInput
                    type="number"
                    min={0}
                    step="0.01"
                    value={total}
                    invalid={Boolean(step1Errores.total)}
                    onChange={(e) => setPrecioTotal(e.target.value)}
                  />
                </ModalField>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ModalField>
                  <ModalLabel>Incoterms</ModalLabel>
                  <ModalInput
                    value={incoterms}
                    onChange={(e) => setIncoterms(e.target.value)}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>Términos de venta</ModalLabel>
                  <ModalTextarea
                    value={terms}
                    invalid={Boolean(step1Errores.terms)}
                    onChange={(e) => {
                      setTerms(e.target.value);
                      setStep1Errores((prev) =>
                        quitarErrorCampoWizardStep1(prev, "terms"),
                      );
                    }}
                    rows={1}
                    className="min-h-10 resize-y"
                  />
                </ModalField>
              </div>
            </div>
          ) : step === 2 ? (
            <div className={cn(vehiculosWizardStepBodyClass, "gap-2.5")}>
              <SectionTitle>Fotografías del vehículo</SectionTitle>
              <VehiculoFotosGaleria
                mode="photos"
                storageFolderId={carStorageFolderId}
                paths={carImagePaths}
                onChange={setCarImagePaths}
                onBusyChange={setImagesBusy}
              />
            </div>
          ) : (
            <div
              className={cn(
                vehiculosWizardStepBodyClass,
                hasFacturaPdf && vehiculosWizardFacturaStepClass,
                "gap-2.5",
              )}
            >
              <SectionTitle>Factura</SectionTitle>
              <VehiculoFotosGaleria
                mode="factura"
                maxPhotos={1}
                storageFolderId={carStorageFolderId}
                invoiceNumber={invoiceNumber}
                paths={carImagePaths}
                onChange={setCarImagePaths}
                onBusyChange={setImagesBusy}
              />
            </div>
          )}

          <ModalFooter className="shrink-0">
            <div className={vehiculosWizardFooterActionsClass}>
              {step === 1 ? (
                <>
                  <ModalCancelButton
                    onClick={handleClose}
                    disabled={pending}
                    className={vehiculosWizardFooterButtonClass}
                  />
                  <SigetActionButton
                    label="Siguiente"
                    accentColor={sigetAccent.guardar}
                    morphFrom={ArrowRight as IconNode}
                    morphTo={ArrowRight as IconNode}
                    morphOnHover={false}
                    onClick={() => void goNext()}
                    disabled={pending}
                    ariaLabel="Continuar al paso de fotografías"
                    className={vehiculosWizardFooterButtonClass}
                  />
                </>
              ) : (
                <>
                  <ModalCancelButton
                    onClick={handleClose}
                    disabled={pending}
                    className={vehiculosWizardFooterButtonClass}
                  />
                  <SigetActionButton
                    label="Anterior"
                    accentColor={sigetAccent.cancelar}
                    morphFrom={ArrowLeft as IconNode}
                    morphTo={ChevronLeft as IconNode}
                    onClick={() => setStep(step === 3 ? 2 : 1)}
                    disabled={pending}
                    className={vehiculosWizardFooterButtonClass}
                  />
                  {step === 2 ? (
                    <SigetActionButton
                      label="Siguiente"
                      accentColor={sigetAccent.guardar}
                      morphFrom={ArrowRight as IconNode}
                      morphTo={ArrowRight as IconNode}
                      morphOnHover={false}
                      onClick={goToFactura}
                      disabled={pending || imagesBusy || !carStorageFolderId}
                      ariaLabel="Continuar al paso de factura"
                      className={vehiculosWizardFooterButtonClass}
                    />
                  ) : (
                    <ModalSubmit
                      disabled={pending || imagesBusy || !carStorageFolderId}
                      label="Guardar"
                      className={vehiculosWizardFooterButtonClass}
                    />
                  )}
                </>
              )}
            </div>
          </ModalFooter>
        </ModalForm>
      )}
    </ModalShell>
  );
}
