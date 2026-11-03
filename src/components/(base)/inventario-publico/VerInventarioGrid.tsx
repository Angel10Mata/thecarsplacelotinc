"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AboutSection } from "@/components/(base)/(home)/about";
import { ContactSection } from "@/components/(base)/(home)/contact";
import { ServicesSection } from "@/components/(base)/(home)/services";
import { cn } from "@/lib/utils";
import { modulePageShellClass } from "@/lib/module-layout";
import { VEHICULOS_INVENTARIO_PATH } from "@/lib/app-config";
import { VehiculoGaleriaViewerModal } from "@/components/(base)/vehiculos/forms/VehiculoGaleriaViewerModal";
import type { VehiculoListRow } from "@/components/(base)/vehiculos/lib/zod";
import { InventarioPublicoSeccion } from "./InventarioPublicoSeccion";
import { useInventarioUi } from "./lib/inventario-ui-context";
import { usePublicInventory } from "./lib/hooks";
import type { PublicInventoryItem } from "./lib/zod";

const sectionScrollMarginEmbedded =
  "[&_section[id]]:scroll-mt-[calc(var(--banner-height,0px)+var(--app-header-height,var(--header-row-height))+0.5rem)]";

type VerInventarioGridProps = {
  embeddedInVehiculosModule?: boolean;
};

export function VerInventarioGrid({
  embeddedInVehiculosModule = false,
}: VerInventarioGridProps) {
  const pathname = usePathname();
  const onVehiculosInventarioRoute =
    pathname === VEHICULOS_INVENTARIO_PATH ||
    pathname === `${VEHICULOS_INVENTARIO_PATH}/`;
  const fromVehiculosModule = embeddedInVehiculosModule || onVehiculosInventarioRoute;
  const { data: items = [], isLoading, isError } = usePublicInventory();
  const [selected, setSelected] = useState<PublicInventoryItem | null>(null);
  const { setVehiculoDetalleAbierto } = useInventarioUi();
  const detalleAbierto = selected !== null;

  useEffect(() => {
    setVehiculoDetalleAbierto(detalleAbierto);
    return () => setVehiculoDetalleAbierto(false);
  }, [detalleAbierto, setVehiculoDetalleAbierto]);

  return (
    <div className={cn("scroll-smooth", "min-h-0 w-full")}>
      <div
        className={cn(
          modulePageShellClass,
          sectionScrollMarginEmbedded,
          fromVehiculosModule
            ? "min-h-0 pt-0 pb-0 md:pt-0 md:pb-8 mt-0"
            : "min-h-0 pt-0 pb-0 md:pt-0 md:pb-8 mt-0 md:mt-4",
        )}
      >
        <InventarioPublicoSeccion
          embedded
          backFromVehiculos={fromVehiculosModule}
          items={items}
          isLoading={isLoading}
          isError={isError}
          onSelect={setSelected}
        />
        {fromVehiculosModule ? null : (
          <>
            <ServicesSection />
            <AboutSection />
            <ContactSection />
          </>
        )}
      </div>

      <VehiculoGaleriaViewerModal
        row={(selected?.invoiceRow as VehiculoListRow | undefined) ?? null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
