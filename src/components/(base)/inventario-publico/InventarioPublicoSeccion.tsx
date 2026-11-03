"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CarFront, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { AuroraText } from "@/components/ui/aurora-text";
import { TCPL_AURORA_COLORS, TCPL_AURORA_MUTED } from "@/lib/brand-colors";
import { VEHICULOS_MODULE_PATH } from "@/lib/app-config";
import { publicSectionSurface } from "@/components/(base)/(home)/public-section-surfaces";
import { cn } from "@/lib/utils";
import type { PublicInventoryItem } from "./lib/zod";

type InventarioPublicoSeccionProps = {
  embedded?: boolean;
  backFromVehiculos?: boolean;
  showBackToVehiculosLink?: boolean;
  items: PublicInventoryItem[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (item: PublicInventoryItem) => void;
};

function InventoryGridSlot() {
  return (
    <div
      aria-hidden
      className="invisible pointer-events-none hidden overflow-hidden rounded-4xl border border-transparent md:flex md:flex-col"
    >
      <div className="aspect-[4/3] w-full" />
      <div className="flex flex-col p-5 pt-2">
        <div className="flex w-full items-center justify-between">
          <span className="text-xs sm:text-sm">&nbsp;</span>
          <span className="text-lg">&nbsp;</span>
        </div>
        <h3 className="mt-0.5 text-lg">&nbsp;</h3>
        <p className="mt-1 text-xs sm:text-sm">&nbsp;</p>
        <div className="my-3 h-px w-full" />
        <div className="flex items-center justify-between">
          <span className="text-xl">&nbsp;</span>
          <span className="rounded-xl px-5 py-2.5 text-[11px]">&nbsp;</span>
        </div>
      </div>
    </div>
  );
}

export function InventarioPublicoSeccion({
  embedded = false,
  backFromVehiculos = false,
  showBackToVehiculosLink = true,
  items,
  isLoading,
  isError,
  onSelect,
}: InventarioPublicoSeccionProps) {
  const embeddedFromVehiculos = embedded && backFromVehiculos;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "all">(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.vin?.toLowerCase().includes(q) ?? false) ||
        item.invoiceNumber.toLowerCase().includes(q),
    );
  }, [items, searchTerm]);

  const totalPages =
    itemsPerPage === "all" ? 1 : Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = itemsPerPage === "all" ? 0 : (safePage - 1) * itemsPerPage;
  const endIndex =
    itemsPerPage === "all" ? filtered.length : startIndex + itemsPerPage;
  const pageItems = filtered.slice(startIndex, endIndex);
  const emptySlots =
    itemsPerPage === "all" ? 0 : Math.max(0, itemsPerPage - pageItems.length);

  return (
    <section
      id="inventory"
      className={cn(
        "flex w-full flex-col overflow-x-hidden",
        !embeddedFromVehiculos && publicSectionSurface.inventory,
        embedded
          ? embeddedFromVehiculos
            ? "min-h-0 border-0 pt-0"
            : "min-h-0 border-0 pt-8 sm:pt-5 md:pt-2"
          : "min-h-screen snap-start pt-24",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-col px-6 lg:px-12",
          embeddedFromVehiculos ? "gap-2 pb-1 pt-0" : "gap-0",
        )}
      >
        {embeddedFromVehiculos && showBackToVehiculosLink ? (
          <Link
            href={VEHICULOS_MODULE_PATH}
            className="relative z-10 mt-1 inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand/80 md:mt-2 dark:text-brand-bright dark:hover:text-brand-bright/80"
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            Volver a vehículos
          </Link>
        ) : null}

        <div
          className={cn(
            "flex shrink-0 flex-col items-center justify-center text-center transition-all duration-1000 ease-out",
            embeddedFromVehiculos ? "pt-4 sm:pt-5" : "px-0",
          )}
        >
        <h1 className="flex max-w-5xl flex-col items-center font-black uppercase leading-[0.92] tracking-tighter text-3xl sm:text-6xl lg:text-7xl">
          <AuroraText colors={[...TCPL_AURORA_COLORS]}>Premium Selection</AuroraText>
          <AuroraText
            className="text-3xl text-zinc-500 sm:text-5xl lg:text-6xl dark:text-zinc-400"
            colors={[...TCPL_AURORA_MUTED]}
          >
            at The Cars Place.
          </AuroraText>
        </h1>

        <p className="mt-6 mb-6 max-w-xs text-[13px] font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 sm:mt-8 sm:mb-8 sm:max-w-lg sm:text-[15px]">
          Explore our curated inventory of vehicles. Each unit is documented and verified for
          transparency.
        </p>

        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600",
            "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
            embeddedFromVehiculos ? "mb-4" : "mb-6",
          )}
        >
          <CarFront className="size-3.5" aria-hidden />
          Inventory 2026
        </div>

        <div className="flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-border/50 bg-background/40 p-1.5 shadow-xl backdrop-blur-2xl transition-all focus-within:border-primary/50">
          <div className="flex flex-1 items-center gap-3 px-4">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              placeholder="Search by name or VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent py-3 text-sm text-foreground outline-none"
            />
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-foreground px-6 py-3 text-xs font-bold text-background transition-opacity hover:opacity-90"
            aria-label="Filtros"
          >
            <Filter className="size-3.5" aria-hidden />
          </button>
        </div>
        </div>
      </div>

      <div
        className={cn(
          "flex w-full flex-1 flex-col px-6 pb-12 lg:px-12",
          embeddedFromVehiculos ? "mt-6" : "mt-10",
        )}
      >
        {isLoading ? (
          <ModuleDataLoadingPanel className="mx-auto max-w-7xl" minHeightClass="min-h-[16rem]" />
        ) : null}

        {isError ? (
          <p className="py-20 text-center text-sm font-semibold text-destructive">
            Could not load inventory. Try again later.
          </p>
        ) : null}

        {!isLoading && !isError && pageItems.length === 0 ? (
          <p className="py-20 text-center text-base font-semibold text-muted-foreground">
            {searchTerm.trim() ? "No matches for your search." : "No vehicles in catalog yet."}
          </p>
        ) : null}

        {!isLoading && !isError && pageItems.length > 0 ? (
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((item, idx) => {
              const statusAvailable = item.status === "AVAILABLE";
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(item);
                    }
                  }}
                  className={cn(
                    "group relative flex cursor-pointer flex-col overflow-hidden rounded-4xl border border-gray-400 bg-card/30 shadow-none backdrop-blur-sm transition-all duration-700 ease-out hover:-translate-y-1 hover:border-primary/50",
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-gray-400 bg-zinc-900">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={idx < 4}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold uppercase text-muted-foreground">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col p-5 pt-2">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-foreground sm:text-sm">
                        {item.invoiceDateLabel}
                      </span>
                      <span
                        className={cn(
                          "text-lg font-bold uppercase tracking-widest",
                          statusAvailable ? "text-emerald-500" : "text-rose-500",
                        )}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="mt-0.5 truncate text-lg font-bold uppercase tracking-tight text-foreground">
                      {item.title}
                    </h3>

                    {item.vin ? (
                      <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-red-500 sm:text-sm">
                        VIN: {item.vin}
                      </p>
                    ) : null}

                    <div className="my-3 h-px w-full bg-gray-400" />

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-foreground">{item.priceLabel}</span>
                      <span className="rounded-xl bg-foreground px-5 py-2.5 text-[11px] font-bold uppercase text-background">
                        Details
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {Array.from({ length: emptySlots }, (_, i) => (
              <InventoryGridSlot key={`inventory-slot-${i}`} />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && filtered.length > 0 ? (
          <div className="mt-12 flex w-full shrink-0 flex-wrap items-center justify-center gap-4">
            <div className="flex items-center rounded-xl bg-foreground px-6 py-3 text-background shadow-lg">
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  setItemsPerPage(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="cursor-pointer appearance-none bg-transparent text-center text-sm font-bold outline-none"
              >
                <option value={8} className="bg-background text-foreground">
                  8
                </option>
                <option value={16} className="bg-background text-foreground">
                  16
                </option>
                <option value="all" className="bg-background text-foreground">
                  ALL
                </option>
              </select>
            </div>

            <div className="flex items-center gap-6 rounded-xl bg-foreground px-6 py-3 text-background shadow-lg">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-20"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-[3ch] select-none text-center font-mono text-sm font-bold">
                {safePage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-20"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
