export const VEHICULOS_WIZARD_STEPS = 3 as const;

export function vehiculosWizardStepCaption(step: number): string {
  if (step === 1) return "Datos del vehículo";
  if (step === 2) return "Fotografías";
  return "Factura PDF";
}

export const vehiculosWizardModalContentClass =
  "flex h-full min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6 md:min-h-[min(48rem,calc(100dvh-8rem))] max-md:overflow-hidden!";

export const vehiculosWizardFormClass =
  "flex h-full min-h-0 flex-1 flex-col gap-3.5 space-y-0";

export const vehiculosWizardStepBodyClass = "flex flex-col gap-3.5";

export const vehiculosWizardFacturaStepClass = "min-h-0 flex-1";

export const vehiculosWizardFooterActionsClass =
  "flex w-full flex-wrap items-center justify-center gap-3";

export const vehiculosWizardFooterButtonClass = "w-auto min-w-[6.75rem] shrink-0";
