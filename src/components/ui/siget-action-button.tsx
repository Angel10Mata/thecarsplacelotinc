"use client";

import { useState, type CSSProperties } from "react";
import type { IconNode } from "lucide";
import { Loader2 } from "lucide-react";
import { MorphHoverIcon } from "@/components/ui/morph-hover-icon";
import { RippleButton } from "@/components/ui/ripple-button";
import { cn } from "@/lib/utils";
import { TCPL_ACTION } from "@/lib/brand-colors";

export const sigetBtnSurface =
  "h-9 min-w-0 border-2 border-border bg-white px-2.5 py-0 text-xs font-bold shadow-none hover:bg-zinc-50 dark:border-zinc-700 dark:bg-card dark:hover:bg-zinc-800";

export const sigetAccent = {
  abrir: TCPL_ACTION.primary,
  enlace: TCPL_ACTION.warning,
  activa: TCPL_ACTION.success,
  inactiva: TCPL_ACTION.danger,
  editar: TCPL_ACTION.primary,
  guardar: TCPL_ACTION.success,
  cancelar: TCPL_ACTION.warning,
  quitar: TCPL_ACTION.danger,
  crear: TCPL_ACTION.primary,
  excel: TCPL_ACTION.success,
} as const;

// Icono con animación
export function SigetActionIcon({
  from,
  to,
  color,
  hovered,
  morphOnHover = true,
}: {
  from: IconNode;
  to: IconNode;
  color: string;
  hovered: boolean;
  morphOnHover?: boolean;
}) {
  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center [&_svg]:block [&_svg]:size-4">
      <MorphHoverIcon
        from={from}
        to={to}
        size={16}
        color={color}
        strokeWidth={1.75}
        spring="snappy"
        hovered={morphOnHover ? hovered : false}
      />
    </span>
  );
}

// Botón de acción SIGET
export function SigetActionButton({
  label,
  accentColor,
  rippleColor = "#E5E7EB",
  morphFrom,
  morphTo,
  onClick,
  ariaLabel,
  className,
  disabled,
  role,
  ariaChecked,
  ariaBusy,
  morphOnHover = true,
  type = "button",
  iconOnly = false,
  iconLeft = false,
  loading = false,
  style,
}: {
  label: string;
  accentColor: string;
  rippleColor?: string;
  morphFrom: IconNode;
  morphTo: IconNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  role?: "switch";
  ariaChecked?: boolean;
  ariaBusy?: boolean;
  morphOnHover?: boolean;
  type?: "button" | "submit";
  iconOnly?: boolean;
  iconLeft?: boolean;
  loading?: boolean;
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const busy = loading || ariaBusy;

  const iconSlot = (
    <SigetActionIcon
      from={morphFrom}
      to={morphTo}
      color={accentColor}
      hovered={hovered}
      morphOnHover={morphOnHover}
    />
  );

  return (
    <RippleButton
      type={type}
      rippleColor={rippleColor}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      role={role}
      aria-checked={ariaChecked}
      aria-busy={busy || undefined}
      aria-live={busy ? "polite" : undefined}
      disabled={disabled || busy}
      style={style}
      onPointerEnter={!busy && morphOnHover ? () => setHovered(true) : undefined}
      onPointerLeave={!busy && morphOnHover ? () => setHovered(false) : undefined}
      className={cn(
        sigetBtnSurface,
        iconOnly ? "size-9 w-9 shrink-0 px-0" : "w-full",
        disabled && !busy && "pointer-events-none opacity-60",
        busy &&
          "pointer-events-none cursor-wait border-primary/50 ring-2 ring-primary/30 motion-reduce:ring-0",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex max-w-full items-center justify-center leading-none",
          !iconOnly && "w-full gap-2",
        )}
      >
        {busy && !iconOnly ? (
          <>
            <Loader2
              className="size-5 shrink-0 animate-spin motion-reduce:animate-none"
              style={{ color: accentColor }}
              aria-hidden
            />
            <span
              className="truncate leading-none motion-reduce:animate-none animate-pulse"
              style={{ color: accentColor }}
            >
              {label}
            </span>
          </>
        ) : (
          <>
            {iconLeft && !iconOnly ? iconSlot : null}
            {!iconOnly ? (
              <span
                className="truncate leading-none"
                style={{ color: accentColor }}
              >
                {label}
              </span>
            ) : null}
            {!iconLeft ? iconSlot : null}
          </>
        )}
      </span>
    </RippleButton>
  );
}
