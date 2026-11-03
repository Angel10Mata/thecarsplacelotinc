"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV_LINKS } from "./lib/nav-publico";
import { scrollToPublicSection } from "./lib/scroll-public-section";
import { usePublicNavActiveHash } from "./lib/use-public-nav-active";

type NavPublicoEnlacesProps = {
  className?: string;
  linkClassName?: string;
  observerMode: "app-header" | "public-header";
};

export function NavPublicoEnlaces({
  className,
  linkClassName,
  observerMode,
}: NavPublicoEnlacesProps) {
  const activeHash = usePublicNavActiveHash(observerMode);

  return (
    <nav aria-label="Secciones del sitio" className={className}>
      {PUBLIC_NAV_LINKS.map((link) => {
        const isActive = activeHash === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={(event) => {
              if (scrollToPublicSection(link.href)) {
                event.preventDefault();
              }
            }}
            className={cn(
              "group relative shrink-0 whitespace-nowrap text-sm font-bold transition-colors",
              linkClassName,
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
            <span
              className={cn(
                "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all",
                isActive ? "w-full" : "w-0 group-hover:w-full",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
