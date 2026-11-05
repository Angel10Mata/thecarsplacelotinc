"use client";

import { useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, LogOut, Shield } from "lucide-react";
import Swal from "sweetalert2";
import VerPerfil from "@/components/(base)/(users)/profile/VerPerfil";
import { useProfile } from "@/components/(base)/(users)/profile/lib/hooks";
import ModalPasskeys from "@/components/(base)/layout/modals/ModalPasskeys";
import { MorphIconBox } from "@/components/ui/morph-hover-icon";
import { AuroraText } from "@/components/ui/aurora-text";
import { PushNotificationToggle } from "@/components/ui/PushNotificationToggle";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { ADMIN_MENU_ITEMS, APP_MODULES } from "@/lib/app-modules";
import { APP_AJUSTES_PATH, APP_BASE_PATH, APP_NAME, LOGOUT_PATH } from "@/lib/app-config";
import {
  adminIconColors,
  adminMorphIcons,
  moduleIconColors,
  moduleMorphIcons,
  navIconBoxClass,
  navIconColors,
  navMorphIcons,
} from "@/lib/morph-icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { labelRol } from "@/components/(base)/(users)/usuarios/lib/permissions";

// TIPOS

interface MenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User | null;
}

// SUBCOMPONENTES UI

function MenuSectionLabel({
  dotClass,
  labelClass,
  children,
}: {
  dotClass: string;
  labelClass?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-1 mb-3 min-w-0">
      <span className={cn("size-2 rounded-full shrink-0", dotClass)} />
      <span
        className={cn(
          "text-[10px] font-black uppercase tracking-[0.22em] shrink-0",
          labelClass ?? "text-zinc-500 dark:text-zinc-400",
        )}
      >
        {children}
      </span>
      <span
        className="h-px min-w-6 flex-1 bg-zinc-200 dark:bg-zinc-700"
        aria-hidden
      />
    </div>
  );
}

function MenuAccordionChevron({ open }: { open: boolean }) {
  return (
    <ChevronDown
      className={cn(
        "size-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 shrink-0",
        open && "rotate-180",
      )}
    />
  );
}

const MENU_ICON_MAIN = {
  size: 20,
  strokeWidth: 2.25,
  padding: "sm" as const,
};

const MENU_ICON_SUB = {
  size: 18,
  strokeWidth: 2.25,
  padding: "xs" as const,
};

const menuWhiteCard =
  "rounded-2xl border border-zinc-200/90 bg-white shadow-sm overflow-hidden dark:border-zinc-700 dark:bg-zinc-900";

const menuRowHover =
  "hover:bg-zinc-50/90 dark:hover:bg-zinc-800/55 transition-colors";

// MENÚ LATERAL

export default function Menu({ isOpen, setIsOpen, user }: MenuProps) {
  const pathname = usePathname();
  const { realRole, effectiveRole, simulatedRole, setSimulatedRole } =
    useUserContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasskeysOpen, setIsPasskeysOpen] = useState(false);
  const [modulosOpen, setModulosOpen] = useState(true);
  const [cuentaOpen, setCuentaOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const isRoot =
    pathname === APP_BASE_PATH || pathname === `${APP_BASE_PATH}/`;
  const isSuperOrAdmin = ["super", "admin"].includes(effectiveRole);
  const menuTop =
    "top-[calc(var(--banner-height,0px)+var(--app-header-height,var(--header-row-height)))]";
  const menuHeight =
    "h-[calc(100dvh-var(--banner-height,0px)-var(--app-header-height,var(--header-row-height)))]";

  const metadata = user?.user_metadata || {};
  const username =
    metadata.username || user?.email?.split("@")[0] || "Invitado";
  const { profile } = useProfile(user?.id ?? "", isOpen && !!user);
  const displayName = profile?.nombre || metadata.nombre || "Usuario";

  const visibleModules = APP_MODULES.filter((mod) => {
    if (mod.requiresAdmin && !isSuperOrAdmin) return false;
    if (mod.allowedRoles && !mod.allowedRoles.includes(effectiveRole))
      return false;
    return true;
  });

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      background: isDark ? "#000000" : "#ffffff",
      color: isDark ? "#ffffff" : "#000000",
      heightAuto: false,
      customClass: {
        container: "z-[300]",
      },
    });

    if (!result.isConfirmed) return;

    closeMenu();
    try {
      await createClient().auth.signOut({ scope: "local" });
    } catch {
      /* the /logout route still clears server cookies */
    }
    window.location.assign(LOGOUT_PATH);
  };

  const isActivePath = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <VerPerfil
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userId={null}
      />
      <ModalPasskeys
        isOpen={isPasskeysOpen}
        onClose={() => setIsPasskeysOpen(false)}
        user={user}
      />

      {isOpen && (
        <div
          aria-hidden={!isOpen}
          onClick={closeMenu}
          className={cn(
            "fixed right-0 bottom-0 left-0 z-[105] cursor-pointer bg-black/40 backdrop-blur-[2px]",
            menuTop,
            isOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        />
      )}

      <aside
        className={cn(
          "fixed right-0 z-[110] pointer-events-auto w-full sm:w-100 bg-zinc-100 dark:bg-zinc-800 border-l border-border/50 transition-transform duration-500 overflow-y-auto flex flex-col text-foreground",
          menuTop,
          menuHeight,
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none",
        )}
      >
        {user ? (
          <div className="shrink-0 border-b border-border/40 bg-zinc-100 dark:bg-zinc-800">
            <div className="flex w-full items-center justify-between gap-3 px-5 py-3">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-bold text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <LogOut className="size-5 shrink-0" strokeWidth={2.25} aria-hidden />
                Cerrar sesión
              </button>
              <PushNotificationToggle />
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Usuario
                    </p>
                    <p className="font-bold leading-tight text-brand dark:text-brand-bright truncate">
                      {username}
                    </p>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Rol
                    </p>
                    <p className="font-bold leading-tight text-brand dark:text-brand-bright uppercase truncate">
                      {labelRol(effectiveRole)}
                    </p>
                  </div>
                  <div className="col-span-2 min-w-0 border-t border-border/40 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Nombre
                    </p>
                    <p className="font-bold leading-tight text-foreground truncate">
                      {displayName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-b border-border/40 bg-zinc-100 dark:bg-zinc-800">
            <div className="px-5 py-5">
              <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <MorphIconBox
                    from={navMorphIcons.logIn.from}
                    to={navMorphIcons.logIn.to}
                    size={MENU_ICON_MAIN.size}
                    color={navIconColors.brandBright}
                    strokeWidth={MENU_ICON_MAIN.strokeWidth}
                    spring="snappy"
                    padding={MENU_ICON_MAIN.padding}
                    boxClassName={cn("shrink-0", navIconBoxClass.menuTile)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black uppercase tracking-wide text-foreground">
                      Acceso al sistema
                    </p>
                  </div>
                </div>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-bright active:scale-[0.99]"
                >
                  Iniciar sesión
                  <ArrowRight className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 px-4 py-6 pb-8 gap-6">
          {user ? (
            <>
              <section>
                <MenuSectionLabel
                  dotClass="bg-brand"
                  labelClass="text-brand dark:text-brand-bright"
                >
                  Inicio
                </MenuSectionLabel>
                {isRoot ? (
                  <div className="rounded-2xl border border-red-200/90 bg-white p-1.5 shadow-sm dark:border-red-900/45 dark:bg-zinc-900">
                    <Link
                      href={APP_BASE_PATH}
                      onClick={closeMenu}
                      className="flex items-start gap-3 rounded-xl border border-red-200/90 bg-red-50/95 px-4 py-3.5 border-l-4 border-l-brand dark:border-red-800/50 dark:bg-red-950/20 dark:border-l-brand-bright"
                    >
                      <MorphIconBox
                        from={navMorphIcons.home.from}
                        to={navMorphIcons.home.to}
                        size={MENU_ICON_MAIN.size}
                        color={navIconColors.brandBright}
                        strokeWidth={MENU_ICON_MAIN.strokeWidth}
                        spring="snappy"
                        padding={MENU_ICON_MAIN.padding}
                        boxClassName={cn("shrink-0", navIconBoxClass.menuTile)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black uppercase tracking-wide text-brand dark:text-brand-bright">
                          Inicio
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          Panel principal y acceso a los módulos del sistema.
                        </p>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={APP_BASE_PATH}
                    onClick={closeMenu}
                    className={cn(
                      menuWhiteCard,
                      "flex items-start gap-3 px-4 py-3.5",
                      menuRowHover,
                    )}
                  >
                    <MorphIconBox
                      from={navMorphIcons.home.from}
                      to={navMorphIcons.home.to}
                      size={MENU_ICON_MAIN.size}
                      color={navIconColors.brandBright}
                      strokeWidth={MENU_ICON_MAIN.strokeWidth}
                      spring="snappy"
                      padding={MENU_ICON_MAIN.padding}
                      boxClassName={cn("shrink-0", navIconBoxClass.menuTile)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black uppercase tracking-wide text-foreground">
                        Inicio
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        Panel principal y acceso a los módulos del sistema.
                      </p>
                    </div>
                  </Link>
                )}
              </section>

              {visibleModules.length > 0 && (
                <section>
                  <MenuSectionLabel
                    dotClass="bg-brand"
                    labelClass="text-brand dark:text-brand-bright"
                  >
                    Módulos
                  </MenuSectionLabel>
                  <div className={menuWhiteCard}>
                    <button
                      type="button"
                      onClick={() => setModulosOpen((v) => !v)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer",
                        menuRowHover,
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MorphIconBox
                          from={navMorphIcons.fallback.from}
                          to={navMorphIcons.fallback.to}
                          size={MENU_ICON_MAIN.size}
                          color={navIconColors.brandBright}
                          strokeWidth={MENU_ICON_MAIN.strokeWidth}
                          spring="snappy"
                          padding={MENU_ICON_MAIN.padding}
                          boxClassName={cn("shrink-0", navIconBoxClass.menuTile)}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-black uppercase tracking-wide text-foreground">
                            {APP_NAME}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Módulos de negocio del sistema.
                          </p>
                        </div>
                      </div>
                      <MenuAccordionChevron open={modulosOpen} />
                    </button>
                    {modulosOpen && (
                      <div className="border-t border-zinc-200/90 dark:border-zinc-700/80">
                        {visibleModules.map((mod) => {
                          const pair = moduleMorphIcons[mod.id];
                          const palette = moduleIconColors[mod.id];
                          const active = isActivePath(mod.href);
                          return (
                            <Link
                              key={mod.id}
                              href={mod.href}
                              onClick={closeMenu}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-700/70 first:border-t-0",
                                menuRowHover,
                                active &&
                                  "bg-red-50/80 border-l-4 border-l-brand dark:bg-red-950/15 dark:border-l-brand-bright",
                              )}
                            >
                              <MorphIconBox
                                from={pair.from}
                                to={pair.to}
                                size={MENU_ICON_SUB.size}
                                color={palette.color}
                                strokeWidth={MENU_ICON_SUB.strokeWidth}
                                spring="snappy"
                                padding={MENU_ICON_SUB.padding}
                                boxClassName={cn(
                                  "border shrink-0",
                                  palette.boxClass,
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground">
                                  {mod.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                  {mod.desc}
                                </p>
                              </div>
                              <MorphIconBox
                                from={navMorphIcons.chevronRight.from}
                                to={navMorphIcons.chevronRight.to}
                                size={16}
                                color={navIconColors.brandBright}
                                strokeWidth={2}
                                spring="snappy"
                                padding="xs"
                                boxClassName={cn(
                                  "shrink-0 opacity-70",
                                  navIconBoxClass.menuTileSub,
                                )}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section>
                <MenuSectionLabel
                  dotClass="bg-purple-500"
                  labelClass="text-purple-600 dark:text-purple-400"
                >
                  Mi Cuenta
                </MenuSectionLabel>
                <div className={cn(menuWhiteCard, "border-purple-200/70 dark:border-purple-500/25")}>
                  <button
                    type="button"
                    onClick={() => setCuentaOpen((v) => !v)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer",
                      menuRowHover,
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MorphIconBox
                        from={navMorphIcons.user.from}
                        to={navMorphIcons.user.to}
                        size={MENU_ICON_MAIN.size}
                        color="#A855F7"
                        strokeWidth={MENU_ICON_MAIN.strokeWidth}
                        spring="snappy"
                        padding={MENU_ICON_MAIN.padding}
                        boxClassName={cn("shrink-0", navIconBoxClass.menuTile)}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-black uppercase tracking-wide text-foreground">
                          Mi Perfil y Ajustes
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Opciones de cuenta y seguridad.
                        </p>
                      </div>
                    </div>
                    <MenuAccordionChevron open={cuentaOpen} />
                  </button>
                  {cuentaOpen && (
                    <div className="border-t border-zinc-200/90 dark:border-zinc-700/80">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(true);
                          closeMenu();
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer",
                          menuRowHover,
                        )}
                      >
                        <MorphIconBox
                          from={navMorphIcons.user.from}
                          to={navMorphIcons.user.to}
                          size={MENU_ICON_SUB.size}
                          color="#A855F7"
                          strokeWidth={MENU_ICON_SUB.strokeWidth}
                          spring="snappy"
                          padding={MENU_ICON_SUB.padding}
                          boxClassName={cn("shrink-0", navIconBoxClass.menuTileSub)}
                        />
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Mi Perfil
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Datos personales y credenciales.
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPasskeysOpen(true);
                          closeMenu();
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 border-t border-zinc-200/90 dark:border-zinc-700/80 text-left cursor-pointer",
                          menuRowHover,
                        )}
                      >
                        <MorphIconBox
                          from={navMorphIcons.fingerprint.from}
                          to={navMorphIcons.fingerprint.to}
                          size={MENU_ICON_SUB.size}
                          color={navIconColors.success}
                          strokeWidth={MENU_ICON_SUB.strokeWidth}
                          spring="snappy"
                          padding={MENU_ICON_SUB.padding}
                          boxClassName={cn("shrink-0", navIconBoxClass.menuTileSub)}
                        />
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Ingreso Seguro
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Passkeys y acceso sin contraseña.
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {isSuperOrAdmin && (
                <section>
                  <MenuSectionLabel
                    dotClass="bg-brand-bright"
                    labelClass="text-brand dark:text-brand-bright"
                  >
                    Administración
                  </MenuSectionLabel>
                  <div className={cn(menuWhiteCard, "border-brand/20 dark:border-brand-bright/30")}>
                    <button
                      type="button"
                      onClick={() => setAdminOpen((v) => !v)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer",
                        menuRowHover,
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MorphIconBox
                          from={navMorphIcons.settings.from}
                          to={navMorphIcons.settings.to}
                          size={MENU_ICON_MAIN.size}
                          color={navIconColors.brandBright}
                          strokeWidth={MENU_ICON_MAIN.strokeWidth}
                          spring="snappy"
                          padding={MENU_ICON_MAIN.padding}
                          boxClassName={cn("shrink-0", navIconBoxClass.menuTile)}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-black uppercase tracking-wide text-foreground">
                            Ajustes Administrador
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Panel de administración del sistema.
                          </p>
                        </div>
                      </div>
                      <MenuAccordionChevron open={adminOpen} />
                    </button>
                    {adminOpen && (
                      <div className="border-t border-zinc-200/90 dark:border-zinc-700/80">
                        <Link
                          href={`${APP_BASE_PATH}/admin`}
                          onClick={closeMenu}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3",
                            menuRowHover,
                            pathname === `${APP_BASE_PATH}/admin` &&
                              "bg-red-50/80 border-l-4 border-l-brand dark:bg-red-950/15 dark:border-l-brand-bright",
                          )}
                        >
                          <MorphIconBox
                            from={navMorphIcons.settings.from}
                            to={navMorphIcons.settings.to}
                            size={MENU_ICON_SUB.size}
                            color={navIconColors.brandBright}
                            strokeWidth={MENU_ICON_SUB.strokeWidth}
                            spring="snappy"
                            padding={MENU_ICON_SUB.padding}
                            boxClassName={cn("shrink-0", navIconBoxClass.menuTileSub)}
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              Panel Admin
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Vista general de administración.
                            </p>
                          </div>
                        </Link>
                        {ADMIN_MENU_ITEMS.map((item) => {
                          const pair = adminMorphIcons[item.id];
                          const palette = adminIconColors[item.id];
                          const active = isActivePath(item.href);
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={closeMenu}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-700/70",
                                menuRowHover,
                                active &&
                                  "bg-red-50/80 border-l-4 border-l-brand dark:bg-red-950/15 dark:border-l-brand-bright",
                              )}
                            >
                              <MorphIconBox
                                from={pair.from}
                                to={pair.to}
                                size={MENU_ICON_SUB.size}
                                color={palette.color}
                                strokeWidth={MENU_ICON_SUB.strokeWidth}
                                spring="snappy"
                                padding={MENU_ICON_SUB.padding}
                                boxClassName={cn(
                                  "border shrink-0",
                                  palette.boxClass,
                                )}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {realRole === "super" && (
                <div className={cn(menuWhiteCard, "border-amber-200/80 dark:border-amber-500/30")}>
                  <button
                    type="button"
                    onClick={() => setRoleOpen((v) => !v)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer",
                      menuRowHover,
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-zinc-100 dark:border-zinc-600/55 dark:bg-zinc-800">
                        <Shield className="size-5 text-amber-700 dark:text-amber-400" />
                      </span>
                      <span className="text-sm font-bold text-foreground uppercase">
                        Rol Real: {labelRol(realRole)}
                      </span>
                    </div>
                    <MenuAccordionChevron open={roleOpen} />
                  </button>
                  {roleOpen && (
                    <div className="border-t border-zinc-200/90 dark:border-zinc-700/80 px-4 py-3">
                      <select
                        value={simulatedRole || ""}
                        onChange={(e) =>
                          setSimulatedRole(e.target.value || null)
                        }
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <option value="">
                          Sin simulación ({labelRol(realRole)})
                        </option>
                        <option value="admin">Simular: {labelRol("admin")}</option>
                        <option value="user">Simular: {labelRol("user")}</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="mt-auto border-t border-border/60 px-5 py-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              © 2026 KoreAPP
            </p>
            <div className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:text-sm flex items-center gap-1 text-center">
              Powered by{" "}
              <a
                href="https://www.oscar27jimenez.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline cursor-pointer inline-flex items-center"
              >
                <AuroraText className="text-xs whitespace-nowrap sm:text-sm">
                  Kore | Ing. de Software
                </AuroraText>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
