import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";
import { cn } from "@/lib/utils";
import { modulePageHeaderClass, modulePageHeaderStackClass, modulePageShellClass, modulePageTitleClass } from "@/lib/module-layout";
import { VehiculosTabla } from "@/components/(base)/vehiculos/VehiculosTabla";

export function VerVehiculos() {
  return (
    <div
      className={cn(
        modulePageShellClass,
        "min-h-0 gap-2 pt-0 pb-0 md:pt-0 md:pb-8 mt-0 md:mt-4",
      )}
    >
      <header className={modulePageHeaderClass}>
        <div className={modulePageHeaderStackClass}>
          <ModuleHeaderBackButton />
          <h1 className={modulePageTitleClass}>Gestión de vehículos</h1>
        </div>
      </header>

      <VehiculosTabla />
    </div>
  );
}
