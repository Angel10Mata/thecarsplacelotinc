"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useUser, useUserContext } from "@/components/(base)/providers/UserProvider";
import { cn } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { MorphHoverIcon } from "@/components/ui/morph-hover-icon";
import { navMorphIcons } from "@/lib/morph-icons";
import Menu from "./Menu";
import { getPendingDevicesCount } from "@/components/(base)/admin/lib/actions";
import { createPortal } from "react-dom";
import AnimacionLogo from "@/components/(base)/brand/AnimacionLogo";
import { HeaderBrand } from "@/components/(base)/brand/HeaderBrand";
import { NavPublicoEnlaces } from "@/components/(base)/inventario-publico/NavPublicoEnlaces";
import { useInventarioUi } from "@/components/(base)/inventario-publico/lib/inventario-ui-context";
import { PUBLIC_CATALOG_PATH } from "@/lib/app-config";

export default function EncabezadoApp() {
  const user = useUser();
  const { effectiveRole } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDevices, setPendingDevices] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [refreshSpinning, setRefreshSpinning] = useState(false);
  const [refreshRotation, setRefreshRotation] = useState(0);
  const pathname = usePathname();
  const isInventarioPage = pathname === PUBLIC_CATALOG_PATH;
  const isPublicCatalog = isInventarioPage && !user;
  const isLoginPage = pathname === "/login";
  const showBreadcrumb =
    Boolean(user) && !isLoginPage && !isPublicCatalog && !isInventarioPage;
  const showHamburger =
    !isLoginPage && (Boolean(user) || isPublicCatalog);
  const headerRef = useRef<HTMLElement | null>(null);
  const canManage = ["super", "admin"].includes(effectiveRole);
  const { vehiculoDetalleAbierto } = useInventarioUi();
  const ocultarHeaderInventario =
    isInventarioPage && vehiculoDetalleAbierto && Boolean(user);

  useEffect(() => {
    setMounted(true);
    if (!canManage) return;
    getPendingDevicesCount()
      .then((c) => setPendingDevices(c ?? 0))
      .catch(() => setPendingDevices(0));
  }, [canManage]);

  useLayoutEffect(() => {
    if (ocultarHeaderInventario) {
      document.documentElement.style.setProperty("--app-header-height", "0px");
      return () => {
        document.documentElement.style.removeProperty("--app-header-height");
      };
    }
    const header = headerRef.current;
    if (!header) return;
    const sync = () => {
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${header.offsetHeight}px`,
      );
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--app-header-height");
    };
  }, [ocultarHeaderInventario, showBreadcrumb, isInventarioPage, pathname]);

  const handleRefresh = () => {
    if (refreshSpinning) return;
    setRefreshSpinning(true);
    setRefreshRotation((rotation) => rotation + 360);
  };

  if (ocultarHeaderInventario) return null;

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-[var(--banner-height,0px)] w-full shrink-0 border-b border-border/40 bg-zinc-100 shadow-sm transition-all dark:bg-zinc-800",
          isPublicCatalog ? "z-[120]" : "z-[100]",
        )}
      >
        <div className="mx-auto flex min-h-[var(--header-row-height)] flex-col px-1 py-1 md:px-2.5">
          <div className="relative flex w-full items-center justify-between gap-2 py-2.5 md:py-0">
            <button
              type="button"
              onClick={() => setIsFullScreen(true)}
              className="relative z-10 flex min-w-0 shrink-0 cursor-pointer items-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <motion.span
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="block"
              >
                <HeaderBrand compact />
              </motion.span>
            </button>

            {mounted && isInventarioPage ? (
              <NavPublicoEnlaces
                observerMode="app-header"
                linkClassName="text-base md:text-[1.0625rem]"
                className="absolute left-1/2 top-1/2 z-[5] hidden -translate-x-1/2 translate-y-[calc(-50%+0.35rem)] items-center justify-center gap-6 overflow-hidden pb-0.5 md:flex lg:gap-8 xl:gap-10"
              />
            ) : null}

            <div className="relative z-10 flex shrink-0 items-center gap-2.5 md:gap-4">
              {mounted ? <AnimatedThemeToggler /> : null}
              {mounted ? (
                <button
                  id="refresh-btn"
                  type="button"
                  aria-label="Recargar"
                  onClick={handleRefresh}
                  onMouseEnter={() => {
                    if (!refreshSpinning) setRefreshRotation(90);
                  }}
                  onMouseLeave={() => {
                    if (!refreshSpinning) setRefreshRotation(0);
                  }}
                  className="flex cursor-pointer items-center justify-center text-[#dc2626] transition-colors hover:text-[#ef4444] active:scale-95 dark:text-[#ef4444] dark:hover:text-[#ff0000]"
                >
                  <motion.span
                    animate={{ rotate: refreshRotation }}
                    transition={{
                      duration: refreshSpinning ? 0.55 : 0.25,
                      ease: refreshSpinning ? "easeInOut" : "easeOut",
                    }}
                    onAnimationComplete={() => {
                      if (refreshSpinning) window.location.reload();
                    }}
                    className="inline-flex"
                  >
                    <RefreshCw size={24} strokeWidth={2.25} />
                  </motion.span>
                </button>
              ) : null}
              {mounted && showHamburger ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                    className="flex cursor-pointer items-center justify-center text-foreground transition-colors active:scale-95 hover:text-foreground/80"
                  >
                    <MorphHoverIcon
                      from={navMorphIcons.menu.from}
                      to={navMorphIcons.close.from}
                      hovered={isOpen}
                      size={28}
                      color="currentColor"
                      spring="snappy"
                      className="md:scale-[1.14]"
                    />
                  </button>
                  {!isOpen && canManage && pendingDevices > 0 && (
                    <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] animate-pulse items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                      {pendingDevices}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {mounted && isInventarioPage ? (
            <NavPublicoEnlaces
              observerMode="app-header"
              linkClassName="text-base"
              className="flex w-full items-center justify-center gap-5 overflow-hidden border-t border-border/40 px-3 py-2.5 md:hidden"
            />
          ) : null}

          {mounted && showBreadcrumb ? (
            <div className="min-w-0 w-full px-1 py-2.5 md:py-0 md:pb-0.5 md:pt-0.5">
              <BreadcrumbNav />
            </div>
          ) : null}
        </div>
      </header>

      {mounted && showHamburger && (
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} user={user} />
      )}

      {mounted &&
        createPortal(
          <AnimacionLogo
            isOpen={isFullScreen}
            onClose={() => setIsFullScreen(false)}
          />,
          document.body,
        )}
    </>
  );
}
