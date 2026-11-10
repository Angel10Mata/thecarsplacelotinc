import { cn } from "@/lib/utils";
import { Pagination, PageSizeSelect } from "@/components/ui/pagination";

// Pie de tabla (paginación)
export interface ModuleTableFooterProps {
  itemCount: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
}

export function ModuleTableFooter({
  itemCount,
  pageSize,
  setPageSize,
  currentPage,
  totalPages,
  onPageChange,
  pageSizeOptions,
  className,
}: ModuleTableFooterProps) {
  if (itemCount <= 0) return null;

  const showPagination = totalPages > 1;

  const pageSizeSelect = (
    <PageSizeSelect
      pageSize={pageSize}
      setPageSize={(size) => {
        setPageSize(size);
        onPageChange(1);
      }}
      options={pageSizeOptions}
    />
  );

  if (!showPagination) {
    return (
      <div
        className={cn(
          moduleTableFooterClass,
          "w-full items-center justify-center",
          className,
        )}
      >
        {pageSizeSelect}
      </div>
    );
  }

  return (
    <div
      className={cn(
        moduleTableFooterClass,
        "max-sm:flex-col max-sm:items-center max-sm:justify-center sm:justify-between",
        className,
      )}
    >
      <div className="flex shrink-0 max-sm:w-full max-sm:items-center max-sm:justify-center">
        {pageSizeSelect}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="max-sm:justify-center"
      />
    </div>
  );
}

// Clases reutilizables de listas
export const moduleTableAccentBarClass = "h-1 w-full shrink-0 bg-brand";

export const moduleTableShellClass =
  "flex flex-col flex-1 min-w-0 overflow-hidden rounded-2xl border border-border bg-white dark:border-zinc-700 dark:bg-zinc-900 p-5 shadow-none";

export const moduleTableToolbarClass =
  "flex flex-col xl:flex-row gap-4 mb-4 justify-between items-start";

export const moduleTableSearchClass =
  "h-12 w-full rounded-full border border-brand/30 bg-white pl-11 pr-4 text-sm text-foreground outline-none shadow-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15 dark:border-brand-bright/35 dark:bg-zinc-900 dark:text-white dark:focus:border-brand-bright";

export const moduleTableScrollClass =
  "flex-1 overflow-y-auto custom-scrollbar w-full min-h-[400px]";

export const moduleTableEmptyClass =
  "bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-14 text-center text-zinc-400 font-bold";

export const moduleTableDesktopWrapClass =
  "hidden md:block overflow-hidden rounded-2xl border border-border bg-white dark:border-zinc-700 dark:bg-zinc-900 shadow-none";

export const moduleTableListShellClass = cn(
  moduleTableShellClass,
  "relative flex-none overflow-visible p-3 md:p-4",
);

export const moduleTableDesktopWrapListClass = cn(
  moduleTableDesktopWrapClass,
  "md:block overflow-visible pb-4",
);

export const moduleTableDesktopScrollClass = "overflow-x-auto";

export const moduleTableClass = "w-full text-left text-xs border-collapse";

export const moduleTableHeadRowClass =
  "border-b border-border bg-brand-soft text-[10px] font-bold uppercase tracking-widest text-brand dark:border-zinc-700 dark:bg-red-950/35 dark:text-brand-bright";

export const moduleTableHeadCellClass = "px-5 py-3.5";

export const moduleTableBodyClass =
  "divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300";

export const moduleTableRowClass =
  "border-b border-border transition-colors last:border-0 hover:bg-brand-soft/70 dark:border-zinc-800 dark:hover:bg-red-950/15";

export const moduleTableCellClass = "px-5 py-3.5";

export const moduleTableEmptyCellClass =
  "text-center py-14 text-zinc-400 font-bold";

export const moduleTableFooterClass =
  "mt-2 flex h-[3.5625rem] shrink-0 flex-wrap items-center justify-center gap-3 border-t border-zinc-200 px-4 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 sm:flex-row";

// Contenedores de tabla
export function ModuleTableShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(moduleTableShellClass, className)}>{children}</div>;
}

export function ModuleTableScroll({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(moduleTableScrollClass, className)}>{children}</div>
  );
}

export function ModuleTableEmpty({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(moduleTableEmptyClass, className)}>{children}</div>
  );
}

export function ModuleTableDesktop({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(moduleTableDesktopWrapClass, className)}>
      <div className={moduleTableDesktopScrollClass}>{children}</div>
    </div>
  );
}
