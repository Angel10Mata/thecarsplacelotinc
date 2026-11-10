"use client";

import { useState, useEffect } from "react";
import { useAppSettings, useUpdateAppSettings } from "./hooks";
import { Shield, Key } from "lucide-react";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { AppLogo } from "@/components/(base)/brand/AppLogo";
import { Card } from "@/components/ui/card";
import {
  modulePageBackRowClass,
  modulePageCenteredClass,
  modulePageHeaderStackClass,
} from "@/lib/module-layout";
import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";

const settingRowClass =
  "flex items-center justify-between gap-4 rounded-xl border border-zinc-200/90 bg-zinc-50 p-4 transition-colors hover:bg-zinc-100/90 dark:border-zinc-600/55 dark:bg-zinc-900/55 dark:hover:bg-zinc-800/80";

const toggleTrackClass =
  "relative h-6 w-11 rounded-full border border-border bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] peer-focus:outline-none peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-zinc-700 dark:after:border-zinc-500 dark:after:bg-zinc-200";

export default function VerConfiguraciones() {
  const { data: settings, isLoading, isError } = useAppSettings();
  const { mutate: updateSettings, isPending } = useUpdateAppSettings();

  // Estado
  const [requireAuth, setRequireAuth] = useState<boolean>(false);
  const [enablePasskeys, setEnablePasskeys] = useState<boolean>(false);

  useEffect(() => {
    const applySettings = async () => {
      if (settings) {
        setRequireAuth(settings.require_device_authorization);
        setEnablePasskeys(settings.enable_passkeys);
      }
    };
    applySettings();
  }, [settings]);

  if (isLoading) {
    return <ModuleDataLoadingPanel minHeightClass="min-h-[10rem]" />;
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
        Error al cargar los ajustes del sistema.
      </div>
    );
  }

  const handleAuthChange = (checked: boolean) => {
    setRequireAuth(checked);
    updateSettings({
      id: settings?.id,
      require_device_authorization: checked,
      enable_passkeys: enablePasskeys,
    });
  };

  const handlePasskeysChange = (checked: boolean) => {
    setEnablePasskeys(checked);
    updateSettings({
      id: settings?.id,
      require_device_authorization: requireAuth,
      enable_passkeys: checked,
    });
  };

  return (
    <div className={modulePageCenteredClass}>
      <div className={modulePageBackRowClass}>
        <div className={modulePageHeaderStackClass}>
          <ModuleHeaderBackButton />
        </div>
      </div>

      <div className="w-full flex justify-center mb-4">
        <AppLogo size={140} />
      </div>

      <div className="flex w-full flex-col gap-1 text-center items-center">
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">
          Configuraciones
        </h1>
        <p className="text-sm text-muted-foreground ml-0.5">
          Ajustes generales del sistema y seguridad.
        </p>
      </div>

      <Card className="w-full overflow-hidden border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="space-y-6 p-6">
          <div className={settingRowClass}>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-500/10 p-2.5 dark:bg-amber-500/20">
                <Shield className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-0.5 text-left">
                <h3 className="text-base font-semibold text-foreground">Autorización de dispositivos</h3>
                <p className="text-xs text-muted-foreground">Requerir aprobación manual para nuevos dispositivos.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={requireAuth}
                disabled={isPending}
                onChange={(e) => handleAuthChange(e.target.checked)}
              />
              <div className={toggleTrackClass} />
            </label>
          </div>

          <div className={settingRowClass}>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-500/10 p-2.5 dark:bg-purple-500/20">
                <Key className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-0.5 text-left">
                <h3 className="text-base font-semibold text-foreground">Habilitar Passkeys</h3>
                <p className="text-xs text-muted-foreground">Permitir el inicio de sesión sin contraseña.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enablePasskeys}
                disabled={isPending}
                onChange={(e) => handlePasskeysChange(e.target.checked)}
              />
              <div className={toggleTrackClass} />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}