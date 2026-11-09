"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Ban as BanNode, Check as CheckNode, Save, Trash, Trash2, X } from "lucide";
import { MorphHoverIcon } from "@/components/ui/morph-hover-icon";
import {
  AlertTriangle,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Loader2,
} from "lucide-react";
import { obtenerDiasDelMes } from "@/components/ui/CustomDatePicker";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import {
  fechaCalendarioGt,
  formatFechaManualGt,
  normalizarFechaCalendario,
  parseFechaManualGt,
} from "@/lib/fechas-gt";
import { cn } from "@/lib/utils";
import {
  MODULE_DATA_LOADING_LABEL,
  ModuleLoadingSurface,
} from "@/components/ui/module-page-loading";

const MODAL_SHELL_EASE = [0.16, 1, 0.3, 1] as const;

const MODAL_ROOT_TRANSITION = {
  duration: 0.38,
  ease: MODAL_SHELL_EASE,
} as const;

const MODAL_PANEL_TRANSITION = {
  duration: 0.44,
  ease: MODAL_SHELL_EASE,
  delay: 0.03,
} as const;

/** @deprecated Usar MODAL_ROOT_TRANSITION / MODAL_PANEL_TRANSITION */
const MODAL_SHELL_TRANSITION = MODAL_PANEL_TRANSITION;

/** @deprecated Usar MODAL_ROOT_TRANSITION */
const MODAL_OVERLAY_FADE_TRANSITION = MODAL_ROOT_TRANSITION;

const PAGE_SCROLL_OVERFLOW = new Set(["auto", "scroll", "overlay"]);
const PAGE_SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

let pageScrollLocks = 0;
let restorePageScroll: (() => void) | null = null;

function isElementScrollable(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(el);
  const canY =
    PAGE_SCROLL_OVERFLOW.has(style.overflowY) &&
    el.scrollHeight > el.clientHeight + 1;
  const canX =
    PAGE_SCROLL_OVERFLOW.has(style.overflowX) &&
    el.scrollWidth > el.clientWidth + 1;
  return canY || canX;
}

function findScrollableAncestor(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  let el: Element | null = target;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el instanceof HTMLElement && isElementScrollable(el)) return el;
    el = el.parentElement;
  }
  return null;
}

function canElementScroll(el: HTMLElement, deltaX: number, deltaY: number): boolean {
  if (deltaY < 0 && el.scrollTop > 0) return true;
  if (deltaY > 0 && el.scrollTop < el.scrollHeight - el.clientHeight - 1) {
    return true;
  }
  if (deltaX < 0 && el.scrollLeft > 0) return true;
  if (deltaX > 0 && el.scrollLeft < el.scrollWidth - el.clientWidth - 1) {
    return true;
  }
  return false;
}

function applyPageScrollLock() {
  const html = document.documentElement;
  const body = document.body;
  const scrollbarWidth = window.innerWidth - html.clientWidth;
  const lockedX = window.scrollX;
  const lockedY = window.scrollY;
  const prevHtmlOverflow = html.style.overflow;
  const prevBodyOverflow = body.style.overflow;
  const prevHtmlOverscroll = html.style.overscrollBehavior;
  const prevBodyOverscroll = body.style.overscrollBehavior;
  const prevBodyPaddingRight = body.style.paddingRight;
  const prevBodyPosition = body.style.position;
  const prevBodyTop = body.style.top;
  const prevBodyLeft = body.style.left;
  const prevBodyRight = body.style.right;
  const prevBodyWidth = body.style.width;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  body.style.overscrollBehavior = "none";
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
  body.style.position = "fixed";
  body.style.top = `-${lockedY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  html.setAttribute("data-modal-open", "");

  const onWheel = (event: WheelEvent) => {
    const scrollable = findScrollableAncestor(event.target);
    if (scrollable && canElementScroll(scrollable, event.deltaX, event.deltaY)) {
      return;
    }
    event.preventDefault();
  };
  const onTouchMove = (event: TouchEvent) => {
    if (findScrollableAncestor(event.target)) return;
    event.preventDefault();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (!PAGE_SCROLL_KEYS.has(event.key)) return;
    const target = event.target;
    if (target instanceof HTMLElement) {
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (target.isContentEditable) return;
      if (findScrollableAncestor(target)) return;
    }
    event.preventDefault();
  };
  const onScroll = () => {
    window.scrollTo(0, 0);
  };

  document.addEventListener("wheel", onWheel, { capture: true, passive: false });
  document.addEventListener("touchmove", onTouchMove, {
    capture: true,
    passive: false,
  });
  document.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("scroll", onScroll, { capture: true, passive: false });

  return () => {
    window.removeEventListener("scroll", onScroll, { capture: true });
    document.removeEventListener("wheel", onWheel, { capture: true });
    document.removeEventListener("touchmove", onTouchMove, { capture: true });
    document.removeEventListener("keydown", onKeyDown, { capture: true });
    html.style.overflow = prevHtmlOverflow;
    body.style.overflow = prevBodyOverflow;
    html.style.overscrollBehavior = prevHtmlOverscroll;
    body.style.overscrollBehavior = prevBodyOverscroll;
    body.style.paddingRight = prevBodyPaddingRight;
    body.style.position = prevBodyPosition;
    body.style.top = prevBodyTop;
    body.style.left = prevBodyLeft;
    body.style.right = prevBodyRight;
    body.style.width = prevBodyWidth;
    html.removeAttribute("data-modal-open");
    window.scrollTo(lockedX, lockedY);
  };
}

export function lockPageScroll() {
  if (typeof document === "undefined") return () => undefined;
  if (pageScrollLocks === 0) {
    restorePageScroll = applyPageScrollLock();
  }
  pageScrollLocks += 1;
  return () => {
    pageScrollLocks = Math.max(0, pageScrollLocks - 1);
    if (pageScrollLocks === 0 && restorePageScroll) {
      restorePageScroll();
      restorePageScroll = null;
    }
  };
}

export {
  modalActionMessage,
  MODAL_ACTION_ERRORS,
  toast,
} from "@/components/ui/modal-toast";

// Estilos de campos
export const modalFieldClass =
  "border border-zinc-200/80 dark:border-zinc-700 focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/25 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-500/30";

export const modalFieldInvalidClass =
  "border-red-500 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/25 dark:border-red-400 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/30";

export function modalControlFieldClass(
  invalid?: boolean,
  className?: string,
) {
  return cn(modalFieldClass, invalid && modalFieldInvalidClass, className);
}

export const modalAccentClass = "font-bold text-brand dark:text-brand-bright";

const modalInputBaseClass =
  "flex h-10 w-full rounded-lg bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:outline-none";

const modalTextareaBaseClass =
  "flex min-h-20 w-full resize-none rounded-lg bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:outline-none";

// Campos del formulario
export function ModalForm({
  className,
  children,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) {
  const childArray = Children.toArray(children);
  const last = childArray.at(-1);
  const footer =
    isValidElement(last) && last.type === ModalFooter ? last : null;
  const body = footer ? childArray.slice(0, -1) : childArray;

  return (
    <form
      {...props}
      className={cn("flex h-full min-h-0 flex-1 flex-col", className)}
    >
      <div className="scrollbar-zinc flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch]">
        {body}
      </div>
      {footer}
    </form>
  );
}

export function ModalLoadingBody({
  className,
  minHeightClass = "min-h-[20rem]",
}: {
  className?: string;
  minHeightClass?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-1 items-center justify-center bg-transparent",
        minHeightClass,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={MODULE_DATA_LOADING_LABEL}
    >
      <ModuleLoadingSurface />
    </div>
  );
}

export function ModalField({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-2.5", className)}>{children}</div>;
}

export function ModalLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("text-sm leading-none", modalAccentClass, className)}
    />
  );
}

export function ModalInput({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(modalInputBaseClass, modalControlFieldClass(invalid, className))}
    />
  );
}

export function ModalTextarea({
  className,
  invalid,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        modalTextareaBaseClass,
        modalControlFieldClass(invalid, className),
      )}
    />
  );
}

export function ModalFechaInput({
  value,
  onChange,
  id,
  required,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  className?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(formatFechaManualGt(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);

    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setInputValue(formatted);

    if (formatted.length === 10) {
      const parsed = parseFechaManualGt(formatted);
      if (parsed) onChange(parsed);
      return;
    }

    if (formatted === "") onChange("");
  };

  return (
    <ModalInput
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="DD/MM/AAAA"
      value={inputValue}
      onChange={handleChange}
      required={required}
      className={className}
    />
  );
}

const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function fechaDesdeIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ModalFechaCalendario({
  value,
  onChange,
  id,
  required,
  invalid,
  className,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  invalid?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  const normalized = normalizarFechaCalendario(value);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setInputValue(formatFechaManualGt(value));
  }, [value]);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 296 });

  const syncPanelPosition = useCallback(() => {
    const anchor = fieldRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.max(Math.round(rect.width), 296);
    let left = rect.left;
    const maxLeft = window.innerWidth - width - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);

    const panelHeight = panelRef.current?.offsetHeight ?? 340;
    let top = rect.bottom + 8;
    if (top + panelHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - panelHeight - 8);
    }

    setPanelPos({ top, left, width });
  }, []);

  const baseDate = normalized ? fechaDesdeIso(normalized) : new Date();
  const [navMonth, setNavMonth] = useState(baseDate.getMonth());
  const [navYear, setNavYear] = useState(baseDate.getFullYear());

  useEffect(() => {
    if (!normalized) return;
    const d = fechaDesdeIso(normalized);
    setNavMonth(d.getMonth());
    setNavYear(d.getFullYear());
  }, [normalized]);

  useEffect(() => {
    if (!open) return;

    syncPanelPosition();
    const raf = requestAnimationFrame(() => syncPanelPosition());
    window.addEventListener("resize", syncPanelPosition);
    window.addEventListener("scroll", syncPanelPosition, true);
    const anchor = fieldRef.current;
    const observer =
      anchor != null ? new ResizeObserver(() => syncPanelPosition()) : null;
    if (anchor && observer) observer.observe(anchor);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncPanelPosition);
      window.removeEventListener("scroll", syncPanelPosition, true);
      observer?.disconnect();
    };
  }, [open, navMonth, navYear, syncPanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (fieldRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const cells = obtenerDiasDelMes(navMonth, navYear);
  const hoyIso = fechaCalendarioGt();

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);

    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setInputValue(formatted);

    if (formatted.length === 10) {
      const parsed = parseFechaManualGt(formatted);
      if (parsed) onChange(parsed);
      return;
    }

    if (formatted === "") onChange("");
  };

  const handleManualBlur = () => {
    if (inputValue.length === 0) {
      onChange("");
      return;
    }
    if (inputValue.length === 10) {
      const parsed = parseFechaManualGt(inputValue);
      if (parsed) {
        onChange(parsed);
        return;
      }
    }
    setInputValue(formatFechaManualGt(value));
  };

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                top: panelPos.top,
                left: panelPos.left,
                width: panelPos.width,
                zIndex: 250,
              }}
              className="rounded-2xl border border-zinc-200 bg-white p-4 opacity-100 shadow-[0_16px_40px_rgba(15,23,42,0.14)] dark:border-zinc-600 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    if (navMonth === 0) {
                      setNavMonth(11);
                      setNavYear((y) => y - 1);
                      return;
                    }
                    setNavMonth((m) => m - 1);
                  }}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <p className="min-w-0 flex-1 truncate text-center text-sm font-bold capitalize text-brand dark:text-brand-bright">
                  {MESES_ES[navMonth]} {navYear}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (navMonth === 11) {
                      setNavMonth(0);
                      setNavYear((y) => y + 1);
                      return;
                    }
                    setNavMonth((m) => m + 1);
                  }}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
                  <div key={d} className="py-0.5">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, idx) => {
                  const cellIso = `${cell.year}-${pad2(cell.month + 1)}-${pad2(cell.day)}`;
                  const selected = normalized === cellIso;
                  const isToday = hoyIso === cellIso;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(cellIso);
                        setOpen(false);
                      }}
                      className={cn(
                        "mx-auto flex size-9 cursor-pointer items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors",
                        selected &&
                          "bg-brand text-white shadow-sm dark:bg-brand-bright dark:text-zinc-950",
                        !selected &&
                          cell.isCurrentMonth &&
                          isToday &&
                          "ring-2 ring-brand/80 text-brand dark:ring-brand-bright/80 dark:text-brand-bright",
                        !selected &&
                          cell.isCurrentMonth &&
                          !isToday &&
                          "text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        !selected &&
                          !cell.isCurrentMonth &&
                          "text-zinc-400 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:bg-zinc-800/80",
                      )}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-end border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    onChange(hoyIso);
                    setOpen(false);
                  }}
                  className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand/10 dark:text-brand-bright dark:hover:bg-brand-bright/10"
                >
                  Hoy
                </button>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <div className={cn("relative w-full", className)}>
      <div ref={fieldRef} className="relative flex w-full items-center">
        <ModalInput
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD/MM/AAAA"
          value={inputValue}
          onChange={handleManualChange}
          onBlur={handleManualBlur}
          required={required}
          invalid={invalid}
          className={cn("w-full pr-12", inputClassName)}
        />
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Abrir calendario"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-brand transition-colors hover:bg-zinc-100 dark:text-brand-bright dark:hover:bg-zinc-800"
        >
          <Calendar className="size-4" aria-hidden />
        </button>
      </div>
      {panel}
    </div>
  );
}

export function ModalSwitch({
  checked,
  onCheckedChange,
  id,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onCheckedChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-zinc-400 bg-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-500 dark:bg-zinc-600",
        checked &&
          "border-brand bg-brand dark:border-brand-bright dark:bg-brand-bright",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-[1.375rem]",
        )}
      />
    </button>
  );
}

export function ModalSwitchField({
  label,
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <ModalField className={className}>
      <ModalLabel htmlFor={id}>{label}</ModalLabel>
      <div
        className={cn(
          modalInputBaseClass,
          modalFieldClass,
          "flex items-center justify-between gap-3 px-3",
        )}
      >
        <span className="truncate text-sm font-medium text-muted-foreground">
          {checked ? "Sí" : "No"}
        </span>
        <ModalSwitch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label={label}
        />
      </div>
    </ModalField>
  );
}

// Botones del pie
export function ModalCancelButton({
  onClick,
  disabled,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <SigetActionButton
      label="Cancelar"
      accentColor={sigetAccent.cancelar}
      morphFrom={X}
      morphTo={BanNode}
      onClick={onClick}
      disabled={disabled}
      className={cn("w-auto shrink-0", className)}
    />
  );
}

export function ModalSubmit({
  disabled,
  className,
  label = "Guardar",
}: {
  disabled?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <SigetActionButton
      label={label}
      accentColor={sigetAccent.guardar}
      morphFrom={Save}
      morphTo={CheckNode}
      disabled={disabled}
      type="submit"
      className={cn("w-auto shrink-0", className)}
    />
  );
}

export function ModalFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-auto flex shrink-0 flex-wrap items-center justify-center gap-3 border-t border-zinc-200/80 bg-zinc-100 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-zinc-700 dark:bg-zinc-800",
        "max-md:-mx-4 max-md:-mb-4 max-md:w-[calc(100%+2rem)] max-md:rounded-b-none",
        "md:mt-3 md:-mx-6 md:-mb-6 md:w-[calc(100%+3rem)] md:rounded-b-3xl md:pb-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ItemDetailsPreview {
  nombre?: string;
  codigo?: string;
  stock?: number;
  precio?: number;
  imagen?: string | null;
  ubicacion?: string | null;
  categoria?: string | null;
}

function ModalConfirmDeleteHeroIcon({ isDeactivate }: { isDeactivate: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative mb-3 flex items-center justify-center"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "absolute inset-0 animate-pulse rounded-full opacity-75",
          isDeactivate
            ? "bg-amber-500/20 dark:bg-amber-500/25"
            : "bg-red-500/20 dark:bg-red-500/30",
        )}
      />
      <div
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-2xl border shadow-inner",
          isDeactivate
            ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 dark:border-amber-800/60 dark:from-amber-950/60 dark:to-orange-900/40"
            : "border-red-200 bg-gradient-to-br from-red-50 to-rose-100 dark:border-red-800/60 dark:from-red-950/60 dark:to-rose-900/40",
        )}
      >
        <span
          className={cn(
            "inline-flex size-7 items-center justify-center [&_svg]:block",
            isDeactivate
              ? "text-amber-700 dark:text-amber-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {isDeactivate ? (
            <MorphHoverIcon
              from={X}
              to={BanNode}
              size={28}
              color="currentColor"
              strokeWidth={1.75}
              spring="snappy"
              hovered={hovered}
            />
          ) : (
            <MorphHoverIcon
              from={Trash2}
              to={Trash}
              size={28}
              color="currentColor"
              strokeWidth={1.75}
              spring="snappy"
              hovered={hovered}
            />
          )}
        </span>
      </div>
    </div>
  );
}

function useConfirmDeleteDelay(confirmDelaySec?: number): number {
  const [delayLeft, setDelayLeft] = useState(() =>
    confirmDelaySec && confirmDelaySec > 0 ? confirmDelaySec : 0,
  );

  useEffect(() => {
    if (!confirmDelaySec || confirmDelaySec <= 0) {
      setDelayLeft(0);
      return;
    }
    setDelayLeft(confirmDelaySec);
    const tick = window.setInterval(() => {
      setDelayLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [confirmDelaySec]);

  return delayLeft;
}

// Confirmar eliminación
export function ModalConfirmDelete({
  onConfirm,
  onCancel,
  message,
  title = "¿Eliminar registro?",
  description = "Esta acción no se puede deshacer.",
  itemDetails,
  loading = false,
  pending = false,
  confirmText = "Eliminar",
  warningText,
  intent = "delete",
  confirmDelaySec,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  title?: string;
  description?: string;
  itemDetails?: ItemDetailsPreview;
  loading?: boolean;
  pending?: boolean;
  confirmText?: string;
  cancelText?: string;
  /** Texto del aviso inferior. `null` lo oculta; omitir = mensaje según intent. */
  warningText?: string | null;
  intent?: "delete" | "deactivate";
  /** Segundos de espera antes de habilitar confirmar. */
  confirmDelaySec?: number;
}) {
  const isPending = loading || pending;
  const isDeactivate = intent === "deactivate";
  const delayLeft = useConfirmDeleteDelay(confirmDelaySec);
  const confirmLocked = delayLeft > 0;

  const delayHint =
    confirmLocked && confirmDelaySec
      ? `Podrás confirmar en ${delayLeft} s.`
      : null;

  if (message && !itemDetails && title === "¿Eliminar registro?") {
    return (
      <div className="space-y-3 rounded-xl border-2 border-amber-300 bg-amber-100 p-4 dark:border-amber-800 dark:bg-amber-950">
        <p className="text-sm font-semibold text-foreground">{message}</p>
        {delayHint ? (
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
            {delayHint}
          </p>
        ) : null}
        <div className="flex justify-center gap-2">
          <ModalCancelButton onClick={onCancel} disabled={isPending} />
          <SigetActionButton
            label="Eliminar"
            accentColor={sigetAccent.quitar}
            morphFrom={Trash2}
            morphTo={Trash}
            onClick={onConfirm}
            disabled={isPending || confirmLocked}
            ariaLabel={
              confirmLocked
                ? `Confirmar eliminación en ${delayLeft} segundos`
                : "Confirmar eliminación"
            }
            className="w-auto shrink-0"
          />
        </div>
      </div>
    );
  }

  const defaultWarning = isDeactivate
    ? "El producto dejará de mostrarse en ventas. Podrás reactivarlo desde Inactivos."
    : "Esta acción eliminará de forma permanente el registro y no se podrá deshacer.";

  return (
    <div className="flex flex-col items-center p-1 text-center sm:p-3">
      <ModalConfirmDeleteHeroIcon isDeactivate={isDeactivate} />

      <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {message ?? description}
      </p>

      {itemDetails ? (
        <div className="mb-2 mt-4 w-full rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-zinc-50 to-zinc-100/80 p-3.5 text-left shadow-sm dark:border-zinc-700/60 dark:from-zinc-800/80 dark:to-zinc-800/40">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              {itemDetails.imagen ? (
                <img
                  src={itemDetails.imagen}
                  alt={itemDetails.nombre || "Producto"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-base font-bold text-zinc-900 dark:text-zinc-100">
                {itemDetails.nombre || "Producto sin nombre"}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {itemDetails.codigo ? (
                  <span className="inline-flex items-center rounded-md bg-zinc-200/70 px-2 py-0.5 font-mono text-xs font-medium text-zinc-700 dark:bg-zinc-700/70 dark:text-zinc-300">
                    SKU: {itemDetails.codigo}
                  </span>
                ) : null}
                {itemDetails.stock !== undefined ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                      itemDetails.stock > 0
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
                    )}
                  >
                    Stock: {itemDetails.stock} ud.
                  </span>
                ) : null}
                {itemDetails.precio !== undefined ? (
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ${itemDetails.precio.toFixed(2)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {warningText !== null ? (
        <div className="mt-3 flex w-full items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-left text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{warningText ?? defaultWarning}</span>
        </div>
      ) : null}

      {delayHint ? (
        <p className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-300">
          {delayHint}
        </p>
      ) : null}

      <div className="mt-5 flex w-full items-center justify-center gap-3 border-t border-zinc-200/60 pt-3 dark:border-zinc-800">
        <ModalCancelButton onClick={onCancel} disabled={isPending} />
        <SigetActionButton
          label={confirmText}
          accentColor={isDeactivate ? sigetAccent.inactiva : sigetAccent.quitar}
          morphFrom={isDeactivate ? X : Trash2}
          morphTo={isDeactivate ? BanNode : Trash}
          onClick={onConfirm}
          disabled={isPending || confirmLocked}
          ariaLabel={
            confirmLocked
              ? `${confirmText} en ${delayLeft} segundos`
              : confirmText
          }
          className="w-auto shrink-0"
        />
      </div>
    </div>
  );
}

function ModalFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100 shadow-lg max-md:rounded-none max-md:border-0 dark:border-zinc-700 dark:bg-zinc-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Ventana modal principal
export function ModalShell({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  maxWidth = "max-w-md",
  fullscreen = false,
  fullHeight = false,
  contentClassName,
  headerActions,
  headerActionsAlign = "end",
  headerClassName,
  hideCloseButton = false,
  hideHeaderOnMobile = false,
  className,
  frameClassName,
}: {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  fullscreen?: boolean;
  fullHeight?: boolean;
  contentClassName?: string;
  headerActions?: ReactNode;
  headerActionsAlign?: "start" | "end";
  headerClassName?: string;
  hideCloseButton?: boolean;
  hideHeaderOnMobile?: boolean;
  className?: string;
  frameClassName?: string;
}) {
  const visible = open ?? isOpen ?? false;
  const resolvedSubtitle = subtitle ?? description;

  useEffect(() => {
    if (!visible) return;
    return lockPageScroll();
  }, [visible]);

  if (typeof document === "undefined") return null;

  const panelEnter = fullscreen
    ? { y: 8 }
    : fullHeight
      ? { y: 10, scale: 0.992 }
      : { y: 12, scale: 0.988 };
  const panelAnimate = fullscreen
    ? { y: 0 }
    : { y: 0, scale: 1 };
  const panelExit = fullscreen
    ? { y: 6 }
    : { y: 8, scale: 0.992 };

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={`${title}-root`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MODAL_ROOT_TRANSITION}
          className={cn(
            "fixed inset-0 z-[201] flex flex-col overflow-hidden",
            fullscreen
              ? "bg-zinc-100 dark:bg-zinc-900"
              : fullHeight
                ? "max-md:bg-zinc-100 max-md:dark:bg-zinc-900 md:items-center md:justify-center md:p-4"
                : "max-md:flex-col max-md:bg-zinc-100 max-md:dark:bg-zinc-900 md:items-center md:justify-center md:p-4",
          )}
        >
          {!fullscreen ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 hidden bg-black/40 md:block dark:bg-black/55"
            />
          ) : null}
          <motion.div
            initial={panelEnter}
            animate={panelAnimate}
            exit={panelExit}
            transition={MODAL_PANEL_TRANSITION}
            className={cn(
              "relative z-10 flex min-h-0 w-full max-h-full flex-col overflow-hidden",
              fullscreen && "h-dvh max-w-none",
              fullHeight &&
                cn(
                  "max-md:h-dvh max-md:min-h-0 max-md:flex-1 max-md:max-w-none",
                  "md:mx-auto md:h-[calc(100dvh-2rem)] md:max-h-[calc(100dvh-2rem)] md:w-full",
                  maxWidth,
                ),
              !fullscreen &&
                !fullHeight &&
                cn(
                  "max-md:h-dvh max-md:min-h-0 max-md:flex-1 max-md:max-w-none",
                  "md:max-h-[calc(100dvh-2rem)]",
                  maxWidth,
                ),
              className,
            )}
          >
            <ModalFrame
              className={cn(
                fullscreen &&
                  "rounded-none border-0 shadow-none dark:bg-zinc-900 md:rounded-none",
                fullHeight && "max-md:h-full md:h-full md:min-h-0 md:max-h-full",
                frameClassName,
              )}
            >
              <div
                className={cn(
                  "flex shrink-0 items-center gap-3 border-b border-zinc-200/80 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-zinc-700 dark:bg-zinc-900 md:gap-4 md:px-6 md:py-4",
                  hideHeaderOnMobile && "max-md:hidden",
                  headerClassName,
                )}
              >
                {title || resolvedSubtitle ? (
                  <div className="min-w-0 flex-1 shrink">
                    {title ? (
                      <h3
                        className={cn(
                          "truncate text-lg tracking-tight md:text-xl",
                          modalAccentClass,
                        )}
                      >
                        {title}
                      </h3>
                    ) : null}
                    {resolvedSubtitle ? (
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          modalAccentClass,
                        )}
                      >
                        {resolvedSubtitle}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="min-w-0 flex-1" />
                )}
                {headerActions ? (
                  <div
                    className={cn(
                      "flex min-w-0 items-center",
                      headerActionsAlign === "end"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    {headerActions}
                  </div>
                ) : null}
                {!hideCloseButton ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="-mr-1 ml-auto flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-brand transition-colors hover:bg-brand/10 dark:text-brand-bright dark:hover:bg-brand-bright/10"
                    aria-label="Cerrar"
                  >
                    <XIcon size={22} strokeWidth={2.25} />
                  </button>
                ) : null}
              </div>

              <div
                className={cn(
                  "flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-900",
                  contentClassName ??
                    cn(
                      fullscreen &&
                        "items-center justify-center p-4 md:p-6",
                      fullHeight && "p-4 md:p-6",
                      !fullscreen && !fullHeight && "p-4 md:p-6",
                    ),
                )}
              >
                {children}
              </div>
            </ModalFrame>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
