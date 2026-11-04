"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getModuleBackHref, getModuleBackLabel } from "@/lib/module-back-href";

type ModuleHeaderBackButtonProps = {
  className?: string;
  href?: string;
  label?: string;
  ariaLabel?: string;
};

export function ModuleHeaderBackButton({
  className,
  href: hrefProp,
  label: labelProp,
  ariaLabel,
}: ModuleHeaderBackButtonProps) {
  const pathname = usePathname();
  const href = hrefProp ?? getModuleBackHref(pathname);

  if (!href) return null;

  const label = labelProp ?? getModuleBackLabel(pathname, href);

  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? label}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-0.5 text-sm font-bold leading-none text-brand transition-opacity hover:opacity-80",
        "dark:text-brand-bright",
        className,
      )}
    >
      <ChevronLeft className="size-4 shrink-0 stroke-[2.5]" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
