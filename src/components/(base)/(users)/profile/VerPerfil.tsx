"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Shield, ShieldCheck, X, ChevronDown } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { toast } from "react-toastify";
import { useProfile } from "./lib/hooks";
import {
  useUser,
  useUserContext,
} from "@/components/(base)/providers/UserProvider";
import {
  canAssignRole,
  canManageUsers,
  getManageableRoles,
  isUserVisibleToActor,
} from "@/components/(base)/(users)/usuarios/lib/permissions";
import { extractRolesFromProfiles } from "@/components/(base)/(users)/usuarios/lib/helpers";
import { useUsers } from "@/components/(base)/(users)/usuarios/lib/hooks";
import { CamposPerfil } from "./forms/CamposPerfil";
import { CamposUsuario } from "./forms/CamposUsuario";
import { updateProfile } from "./lib/actions";
import { useQueryClient } from "@tanstack/react-query";
import { ModalLoadingBody, ModalShell } from "@/components/ui/general-modal";
import { cn } from "@/lib/utils";
import {
  labelRol,
  normalizeKnownRole,
  ROLE_LABELS,
} from "@/components/(base)/(users)/usuarios/lib/permissions";

interface VerPerfilProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

function useMobileProfileLayout() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}

export default function VerPerfil({ isOpen, onClose, userId }: VerPerfilProps) {
  const sessionUser = useUser();
  const { effectiveRole, realRole } = useUserContext();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"perfil" | "usuario">("perfil");
  const [mounted, setMounted] = useState(false);
  const useMobileShell = useMobileProfileLayout();

  useEffect(() => {
    setMounted(true);
  }, []);

  const targetId = userId || sessionUser?.id || "";
  const isSelf = sessionUser?.id === targetId;
  const isSuper = realRole === "super";

  const { data: usersList } = useUsers(
    canManageUsers(effectiveRole) ? effectiveRole : undefined,
  );

  const { profile, loading, error } = useProfile(targetId, isOpen);

  useEffect(() => {
    if (!isOpen || useMobileShell) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, useMobileShell]);

  const roleLabels = ROLE_LABELS;
  const targetRole = profile?.rol || "user";
  const roleOptions = getManageableRoles(
    effectiveRole,
    extractRolesFromProfiles(usersList),
  );

  const canEdit =
    isSelf ||
    (!!profile?.rol &&
      canManageUsers(effectiveRole) &&
      isUserVisibleToActor(profile.rol, effectiveRole));

  const canChangeRole =
    canEdit &&
    !isSelf &&
    canManageUsers(effectiveRole) &&
    isUserVisibleToActor(targetRole, effectiveRole) &&
    roleOptions.length > 0 &&
    !(effectiveRole === "admin" && targetRole === "super");

  const handleRoleUpdate = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (!canAssignRole(effectiveRole, newRole)) {
      toast.error("No tienes permiso para asignar este rol.");
      return;
    }
    try {
      await updateProfile(targetId, { rol: newRole as "user" | "admin" | "super" });
      await queryClient.invalidateQueries({ queryKey: ["profile", targetId] });
      await queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success("Rol actualizado.");
    } catch {
      toast.error("Error al actualizar rol.");
    }
  };

  if (!isOpen || !mounted) return null;

  const profileBody = loading ? (
    <ModalLoadingBody minHeightClass="min-h-[10rem]" />
  ) : error ? (
    <div className="flex h-40 flex-col items-center justify-center gap-3 text-red-500">
      <p className="text-sm font-bold">Error al cargar perfil</p>
      <p className="text-xs opacity-70">{String(error)}</p>
    </div>
  ) : (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {view === "perfil" ? (
        <CamposPerfil userId={targetId} canEdit={canEdit} />
      ) : (
        <CamposUsuario
          userId={targetId}
          canEdit={canEdit}
          isSuper={isSuper}
          onClose={onClose}
          targetName={profile?.nombre ?? undefined}
        />
      )}
    </div>
  );

  const viewTabs = (fullWidth = false) => (
    <div
      className={cn(
        "flex items-center rounded-xl border border-border/40 bg-muted/50 p-1",
        fullWidth ? "w-full" : "shrink-0",
      )}
    >
      <button
        type="button"
        onClick={() => setView("perfil")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200",
          fullWidth && "flex-1 justify-center",
          view === "perfil"
            ? "bg-blue-700 text-blue-200 dark:bg-blue-900 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-900"
            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        )}
      >
        <User size={12} />
        Información
      </button>
      <button
        type="button"
        onClick={() => setView("usuario")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200",
          fullWidth && "flex-1 justify-center",
          view === "usuario"
            ? "bg-purple-700 text-purple-200 dark:bg-purple-900 dark:text-purple-200 ring-1 ring-purple-200 dark:ring-purple-900"
            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        )}
      >
        <Shield size={12} />
        Acceso
      </button>
    </div>
  );

  const mobileProfileChrome = (
    <div className="mb-3 shrink-0 border-b border-zinc-200/80 px-4 pb-3 dark:border-zinc-700">
      {viewTabs(true)}
    </div>
  );

  if (useMobileShell) {
    return (
      <ModalShell
        open={isOpen}
        onClose={onClose}
        title={profile?.nombre || "Usuario"}
        fullHeight
        maxWidth={view === "perfil" ? "max-w-3xl" : "max-w-2xl"}
        contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-0 pt-4 max-md:px-0"
      >
        {mobileProfileChrome}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-md:overflow-visible">
          {profileBody}
        </div>
      </ModalShell>
    );
  }

  const desktopModal = (
    <div className="fixed inset-0 z-[201] flex items-center justify-center overflow-y-auto bg-background/60 p-4 backdrop-blur-md">
      <MagicCard
        className={cn(
          "flex w-full flex-col overflow-hidden border border-border/60 bg-card shadow-none",
          "max-h-[calc(100dvh-2rem)] rounded-3xl",
          view === "perfil"
            ? "max-w-[min(92%,60rem)]"
            : "max-w-[min(92%,48rem)]",
        )}
      >
        <div className="relative shrink-0 border-b border-border/40 bg-muted/5 px-6 pb-4 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="relative aspect-square h-12 w-12 shrink-0 rounded-2xl border border-border/60 bg-background p-1">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight text-foreground">
                  {profile?.nombre || "Usuario"}
                </h2>
                <div className="mt-1 flex items-center">
                  <div className="group relative">
                    <div className="flex items-center rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      <ShieldCheck size={12} className="mr-1" />
                      <span>
                        {profile?.rol ? labelRol(profile.rol) : "USUARIO"}
                      </span>
                      {canChangeRole && (
                        <ChevronDown size={10} className="ml-1 opacity-70" />
                      )}
                    </div>
                    {canChangeRole && (
                      <select
                        value={normalizeKnownRole(profile?.rol || "user")}
                        onChange={handleRoleUpdate}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {roleLabels[role] || role.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {viewTabs(false)}

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col bg-background/50 px-4 py-4 sm:px-6",
            view === "perfil"
              ? "overflow-hidden py-3 sm:px-2"
              : "overflow-y-auto custom-scrollbar",
          )}
        >
          {profileBody}
        </div>
      </MagicCard>
    </div>
  );

  return createPortal(desktopModal, document.body);
}
