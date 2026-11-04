"use client";

import { useState, useEffect } from "react";
import { useAppSettings, useUpdateAppSettings } from "./hooks";
import { Shield, Key } from "lucide-react";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { AppLogo } from "@/components/(base)/brand/AppLogo";
import { Card } from "@/components/ui/card";
import { modulePageCenteredClass } from "@/lib/module-layout";
import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";

// Configuración
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
      <div className="p-4 text-red-500 bg-red-50 rounded-lg font-medium">
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
      {/* LOGO CENTRADO */}
      <div className="w-full flex justify-center mb-4">
        <AppLogo size={140} />
      </div>

      <div className="flex w-full flex-col gap-1 text-center items-center">
        <ModuleHeaderBackButton className="self-start px-3 sm:px-4 md:px-0" />
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">
          Configuraciones
        </h1>
        <p className="text-sm text-muted-foreground ml-0.5">
          Ajustes generales del sistema y seguridad.
        </p>
      </div>

      <Card className="bg-white border border-border shadow-sm overflow-hidden w-full">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-background hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Shield className="size-5 text-amber-500" />
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
              <div className="w-11 h-6 bg-muted border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-background hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Key className="size-5 text-purple-500" />
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
              <div className="w-11 h-6 bg-muted border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}