import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";
import { cn } from "@/lib/utils";
import { modulePageShellClass } from "@/lib/module-layout";
import { VehiculosTabla } from "@/components/(base)/vehiculos/VehiculosTabla";

export function VerVehiculos() {
  return (
    <div
      className={cn(
        modulePageShellClass,
        "min-h-0 gap-2 pt-0 pb-0 md:pt-0 md:pb-8 mt-0 md:mt-4",
      )}
    >
      <header className="mb-0 pt-3 md:pt-0">
        <div className="flex items-center gap-3 pl-3 md:pl-0">
          <ModuleHeaderBackButton size="sm" />
          <h1 className="min-w-0 text-xl font-black uppercase leading-none tracking-tight text-foreground sm:text-2xl md:text-3xl">
            Gestión de vehículos
          </h1>
        </div>
      </header>

      <VehiculosTabla />
    </div>
  );
}
