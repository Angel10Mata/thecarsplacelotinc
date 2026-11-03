"use client";

import { useState } from "react";
import Link from "next/link";
import { CarFront, EllipsisVertical, Info, LayoutGrid, LogIn, PhoneCall, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { HeaderBrand } from "@/components/(base)/brand/HeaderBrand";
import { APP_BASE_PATH, PUBLIC_CATALOG_PATH } from "@/lib/app-config";
import { NavPublicoEnlaces } from "./NavPublicoEnlaces";
import { PUBLIC_NAV_LINKS } from "./lib/nav-publico";
import { scrollToPublicSection } from "./lib/scroll-public-section";

const navLinkIcons = {
  "#inventory": CarFront,
  "#services": LayoutGrid,
  "#about": Info,
  "#contact": PhoneCall,
} as const;

export function EncabezadoPublico() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
          <Link
            href={PUBLIC_CATALOG_PATH}
            className="flex min-w-0 items-center transition-transform hover:scale-[1.02] active:scale-95"
          >
            <HeaderBrand compact />
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <NavPublicoEnlaces
              observerMode="public-header"
              className="flex items-center gap-8 border-r border-border/50 pr-8"
            />
            <div className="flex items-center gap-4">
              <AnimatedThemeToggler />
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-xs font-bold text-background transition-opacity hover:opacity-90"
              >
                <LogIn className="size-4" aria-hidden />
                Sign In
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <AnimatedThemeToggler />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center rounded-xl border border-border/50 p-2.5 text-foreground hover:bg-muted/50"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? <X className="size-6" /> : <EllipsisVertical className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/40 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-[45] h-full w-4/5 max-w-xs border-l border-border/50 bg-background/95 p-8 shadow-2xl backdrop-blur-xl transition-transform duration-500 lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <nav className="mt-20 flex flex-col gap-3">
          {PUBLIC_NAV_LINKS.map((link) => {
            const Icon = navLinkIcons[link.href];
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(event) => {
                  if (scrollToPublicSection(link.href)) {
                    event.preventDefault();
                  }
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <Icon className="size-4" aria-hidden />
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-xs font-bold text-background"
          >
            <LogIn className="size-4" aria-hidden />
            Sign In
          </Link>
          <Link
            href={`${APP_BASE_PATH}/vehiculos`}
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-xs font-bold text-foreground"
          >
            Panel
          </Link>
        </nav>
      </aside>
    </>
  );
}
