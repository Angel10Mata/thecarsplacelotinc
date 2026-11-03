import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";
import { cn } from "@/lib/utils";
import { modulePageHeaderClass, modulePageHeaderRowClass, modulePageShellClass, modulePageTitleClass } from "@/lib/module-layout";
import { ClientesTabla } from "@/components/(base)/clientes/ClientesTabla";

export function VerClientes() {
  return (
    <div
      className={cn(
        modulePageShellClass,
        "min-h-0 gap-2 pt-0 pb-0 md:pt-0 md:pb-8 mt-0 md:mt-4",
      )}
    >
      <header className={modulePageHeaderClass}>
        <div className={modulePageHeaderRowClass}>
          <ModuleHeaderBackButton size="sm" />
          <h1 className={modulePageTitleClass}>Gestión de clientes</h1>
        </div>
      </header>

      <ClientesTabla />
    </div>
  );
}
