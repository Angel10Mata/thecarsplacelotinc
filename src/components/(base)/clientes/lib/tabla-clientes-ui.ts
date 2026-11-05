import type { CSSProperties } from "react";
import { sigetTablaAnchoAccionesRem } from "@/components/ui/siget-tabla-acciones-ui";

export type ClientesTablaColAncho = {
  width: string;
  minWidth?: string;
  maxWidth?: string;
};

export function clientesTablaColAnchoStyle(
  col: ClientesTablaColAncho,
): CSSProperties {
  return {
    width: col.width,
    minWidth: col.minWidth,
    maxWidth: col.maxWidth,
  };
}

export const clientesTablaAnchoNo: ClientesTablaColAncho = {
  width: "3rem",
  maxWidth: "3rem",
};

export const clientesTablaAnchoNombre: ClientesTablaColAncho = {
  width: "32%",
};

export const clientesTablaAnchoNit: ClientesTablaColAncho = {
  width: "1px",
};

export const clientesTablaAnchoVeh: ClientesTablaColAncho = {
  width: sigetTablaAnchoAccionesRem,
  minWidth: sigetTablaAnchoAccionesRem,
  maxWidth: sigetTablaAnchoAccionesRem,
};

export const clientesTablaAnchoAcc: ClientesTablaColAncho = {
  width: sigetTablaAnchoAccionesRem,
  minWidth: sigetTablaAnchoAccionesRem,
  maxWidth: sigetTablaAnchoAccionesRem,
};

export const clientesTablaDesktopTableWrapClass =
  "hidden w-full min-w-0 overflow-x-auto overflow-y-visible lg:block";

export const clientesTablaMobileCardsWrapClass = "flex w-full flex-col lg:hidden";

export const clientesTablaAccentBarClass = "h-1 w-full shrink-0 bg-brand";

export const clientesTablaCardShellClass =
  "overflow-hidden rounded-2xl border border-border bg-white shadow-none dark:border-zinc-700 dark:bg-zinc-900";

export const clientesTablaToolbarSectionClass =
  "w-full shrink-0 px-5 py-5";

export const clientesTablaToolbarGridClass =
  "flex w-full min-w-0 flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-3";

export const clientesTablaToolbarFiltersClass =
  "flex min-w-0 w-full flex-col gap-2 sm:flex-row sm:items-center";

export const clientesTablaToolbarButtonsClass =
  "flex w-full min-w-0 flex-row flex-wrap items-center justify-end gap-1 max-lg:flex-col max-lg:items-stretch max-lg:gap-2 max-lg:[&>*]:w-full [&_button]:w-auto max-lg:[&_button]:w-full";

export const clientesTablaToolbarButtonsMobileGridClass =
  "max-lg:!grid max-lg:!w-full max-lg:grid-cols-2 max-lg:gap-2 max-lg:[&>*]:min-w-0 max-lg:[&>*]:w-full max-lg:[&>:only-child]:col-span-2";

export const clientesTablaSearchInputClass =
  "h-12 w-full rounded-full border border-brand/30 bg-white pl-11 pr-4 text-sm text-foreground outline-none shadow-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15 dark:border-brand-bright/35 dark:bg-zinc-900 dark:focus:border-brand-bright dark:focus:ring-brand-bright/20";

export const clientesTablaAddOutlineButtonClass =
  "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-brand bg-transparent px-4 text-sm font-bold text-brand shadow-none transition-colors hover:bg-brand/10 dark:border-brand-bright dark:text-brand-bright dark:hover:bg-brand-bright/10 max-lg:w-full max-lg:text-base";

export const clientesTablaHeadRowClass =
  "border-b border-border bg-brand-soft text-xs font-bold uppercase tracking-widest text-brand dark:border-zinc-700 dark:bg-red-950/35 dark:text-brand-bright";

export const clientesTablaBodyRowClass =
  "border-b border-border transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40";

export const clientesTablaCellDividerClass =
  "border-r border-border dark:border-zinc-800";

export const clientesTablaAccentTextClass =
  "text-brand dark:text-brand-bright";

export const clientesTablaPaginationBarClass =
  "flex h-[3.5625rem] shrink-0 flex-wrap items-center justify-center gap-3 border-t border-border px-4 text-muted-foreground dark:border-zinc-700";

export const clientesTablaPaginationControlClass =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-0 text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-bright dark:hover:bg-brand-bright/10";
