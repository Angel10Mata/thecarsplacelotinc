import { isCarPdfStoragePath } from "./car-images";
import { carStorageFolderFromMarcaModeloInput } from "./helpers";

export type VehiculosWizardStep1Campo =
  | "invoiceNumber"
  | "invoiceDate"
  | "carVin"
  | "marcaModelo"
  | "total"
  | "terms";

export type VehiculosWizardStep1Errores = Partial<
  Record<VehiculosWizardStep1Campo, true>
>;

export function erroresVehiculosWizardStep1(input: {
  invoiceNumber: string;
  invoiceDate: string;
  carVin: string;
  marcaModelo: string;
  total: string;
  terms: string;
}): VehiculosWizardStep1Errores {
  const errores: VehiculosWizardStep1Errores = {};
  if (!input.invoiceNumber.trim()) {
    errores.invoiceNumber = true;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.invoiceDate)) {
    errores.invoiceDate = true;
  }
  if (!input.carVin.trim()) {
    errores.carVin = true;
  }
  const marca = input.marcaModelo.trim();
  if (!marca || !carStorageFolderFromMarcaModeloInput(input.marcaModelo)) {
    errores.marcaModelo = true;
  }
  if (input.total === "" || Number(input.total) < 0) {
    errores.total = true;
  }
  if (!input.terms.trim()) {
    errores.terms = true;
  }
  return errores;
}

export function vehiculosWizardStep1TieneErrores(
  errores: VehiculosWizardStep1Errores,
): boolean {
  return Object.keys(errores).length > 0;
}

export function quitarErrorCampoWizardStep1(
  errores: VehiculosWizardStep1Errores,
  campo: VehiculosWizardStep1Campo,
): VehiculosWizardStep1Errores {
  if (!errores[campo]) return errores;
  const next = { ...errores };
  delete next[campo];
  return next;
}

const ETIQUETA_CAMPO_WIZARD_STEP1: Record<VehiculosWizardStep1Campo, string> = {
  invoiceNumber: "número de factura",
  invoiceDate: "fecha de factura",
  carVin: "VIN",
  marcaModelo: "marca / modelo",
  total: "precio o total",
  terms: "términos de venta",
};

export function mensajeToastCamposWizardStep1(
  errores: VehiculosWizardStep1Errores,
): string {
  const etiquetas = (
    Object.keys(errores) as VehiculosWizardStep1Campo[]
  ).map((campo) => ETIQUETA_CAMPO_WIZARD_STEP1[campo]);
  if (etiquetas.length === 0) {
    return "Completa los campos obligatorios del paso 1.";
  }
  if (etiquetas.length === 1) {
    return `Falta completar: ${etiquetas[0]}.`;
  }
  return `Faltan completar: ${etiquetas.join(", ")}.`;
}

export function contarFotosVehiculoWizard(paths: string[]): number {
  return paths.filter((path) => !isCarPdfStoragePath(path)).length;
}

export function vehiculosWizardTieneFacturaPdf(paths: string[]): boolean {
  return paths.some((path) => isCarPdfStoragePath(path));
}

export const MENSAJE_TOAST_FALTA_FOTOS =
  "Sube al menos una fotografía del vehículo.";

export const MENSAJE_TOAST_FALTA_FACTURA =
  "Sube la factura en PDF del vehículo.";
