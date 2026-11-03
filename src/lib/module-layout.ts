// CLASES DE LAYOUT POR MÓDULO

export const moduleContentMaxWidth = "max-w-screen-2xl";

export const modulePageShellClass = [
  "w-full",
  moduleContentMaxWidth,
  "mx-auto flex flex-col gap-6",
  "px-0 md:px-5",
  "pt-32 pb-0 md:pt-28 md:pb-8",
  "relative mt-4 md:mt-4 min-h-screen",
].join(" ");

export const modulePageShellFixedClass = [
  "w-full",
  moduleContentMaxWidth,
  "mx-auto flex flex-col gap-6",
  "px-0 md:px-5",
  "pt-32 pb-0 md:pt-28 md:pb-8",
  "relative mt-4 md:mt-4 flex-1 min-h-0 h-screen",
].join(" ");

export const dashboardOuterClass =
  "relative z-10 w-full flex-1 flex flex-col items-stretch justify-start px-3 sm:px-4 md:px-5 lg:px-6 py-4 pb-6 md:py-12 min-h-0 md:mt-4";

export const dashboardInnerClass = [
  "w-full",
  moduleContentMaxWidth,
  "mx-auto",
  "flex flex-col items-stretch",
].join(" ");

export const adminPageShellClass = [
  "space-y-8 w-full",
  moduleContentMaxWidth,
  "mx-auto px-3 sm:px-4 md:px-5 pt-32 md:pt-28",
].join(" ");

export const modulePageCenteredClass = [
  "w-full",
  moduleContentMaxWidth,
  "mx-auto flex flex-col items-center space-y-8",
  "px-3 sm:px-4 md:px-5",
  "pt-28 lg:pt-24 pb-8",
].join(" ");

export const modulePageScrollClass = [
  "flex flex-col h-[calc(100vh-4rem)] w-full",
  moduleContentMaxWidth,
  "mx-auto overflow-hidden",
  "px-3 sm:px-4 md:px-5",
  "pt-3 md:pt-0 pb-10 mt-0 md:mt-4",
].join(" ");

export const moduleControlsShellClass =
  "flex flex-col flex-none min-w-0 bg-white dark:bg-zinc-900 border-y md:border border-zinc-200 dark:border-zinc-800 md:rounded-3xl shadow-sm";

export const moduleListPageShellClass = [
  "w-full",
  moduleContentMaxWidth,
  "mx-auto flex flex-col gap-3",
].join(" ");

export const modulePageHeaderClass = "mb-0 pt-3 md:pt-0";

export const modulePageHeaderRowClass =
  "flex items-center gap-3 px-3 sm:px-4 md:px-0";

export const modulePageHeaderRowInsetClass = "flex items-center gap-3";

export const modulePageTitleClass =
  "min-w-0 flex-1 text-xl font-black uppercase leading-none tracking-tight text-foreground sm:text-2xl md:text-3xl";

export const inventarioPageShellClass = [
  "w-full",
  moduleContentMaxWidth,
  "mx-auto flex flex-col gap-3",
  "px-3 sm:px-4 md:px-5",
  "pt-28 pb-10 md:pt-24 md:pb-12",
].join(" ");
