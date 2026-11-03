"use client";

import { useEffect, useState } from "react";
import { PUBLIC_NAV_LINKS } from "./nav-publico";
import { syncPublicSectionHash } from "./scroll-public-section";

function initialActiveHash(): string {
  if (typeof window === "undefined") return "#inventory";
  const hash = window.location.hash;
  if (PUBLIC_NAV_LINKS.some((link) => link.href === hash)) return hash;
  return "#inventory";
}

function cssVarPx(name: string, fallbackPx: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallbackPx;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallbackPx;
}

function intersectionRootMarginTop(mode: "app-header" | "public-header"): string {
  if (mode === "public-header") {
    return "-88px 0px -45% 0px";
  }
  const banner = cssVarPx("--banner-height", 0);
  const header =
    cssVarPx("--app-header-height", 0) || cssVarPx("--header-row-height", 56);
  return `-${Math.round(banner + header + 8)}px 0px -45% 0px`;
}

export function usePublicNavActiveHash(mode: "app-header" | "public-header") {
  const [activeHash, setActiveHash] = useState<string>(initialActiveHash);

  useEffect(() => {
    const sectionIds = PUBLIC_NAV_LINKS.map((link) => link.href.replace("#", ""));

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const top = visible[0];
          if (top?.target.id) {
            const next = `#${top.target.id}`;
            setActiveHash(next);
            syncPublicSectionHash(next, "replace");
          }
        },
        {
          rootMargin: intersectionRootMarginTop(mode),
          threshold: [0, 0.15, 0.35, 0.5],
        },
      );

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    };

    attach();
    window.addEventListener("resize", attach);
    return () => {
      window.removeEventListener("resize", attach);
      observer?.disconnect();
    };
  }, [mode]);

  return activeHash;
}
