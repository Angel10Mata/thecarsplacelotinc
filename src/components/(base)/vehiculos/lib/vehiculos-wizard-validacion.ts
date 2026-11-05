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
