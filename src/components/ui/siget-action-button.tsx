"use client";

import { useState, type CSSProperties } from "react";
import type { IconNode } from "lucide";
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
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <RippleButton
      type={type}
      rippleColor={rippleColor}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      role={role}
      aria-checked={ariaChecked}
      aria-busy={ariaBusy || undefined}
      disabled={disabled}
      style={style}
      onPointerEnter={morphOnHover ? () => setHovered(true) : undefined}
      onPointerLeave={morphOnHover ? () => setHovered(false) : undefined}
      className={cn(
        sigetBtnSurface,
        iconOnly ? "size-9 w-9 shrink-0 px-0" : "w-full",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex max-w-full items-center justify-center leading-none",
          !iconOnly && "w-full gap-1",
        )}
      >
        {iconLeft ? (
          <SigetActionIcon
            from={morphFrom}
            to={morphTo}
            color={accentColor}
            hovered={hovered}
            morphOnHover={morphOnHover}
          />
        ) : null}
        {!iconOnly ? (
          <span className="truncate leading-none" style={{ color: accentColor }}>
            {label}
          </span>
        ) : null}
        {!iconLeft ? (
          <SigetActionIcon
            from={morphFrom}
            to={morphTo}
            color={accentColor}
            hovered={hovered}
            morphOnHover={morphOnHover}
          />
        ) : null}
      </span>
    </RippleButton>
  );
}
