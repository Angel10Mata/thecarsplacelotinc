"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";
import { MagicCard } from "@/components/ui/magic-card";
import {
  X,
  Eye,
  EyeOff,
  Wand2,
  UserPlus,
  ClipboardCopy,
} from "lucide-react";
import {
  UserPlus as UserPlusNode,
  Check as CheckNode,
  Send as SendNode,
  ArrowLeft as ArrowLeftNode,
  MessageCircle as MessageCircleNode,
} from "lucide";
import { cn } from "@/lib/utils";
import { useSignupLogic } from "./lib/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { authSchema, INITIAL_USER_PASSWORD } from "./lib/zod";
import { AuroraText } from "@/components/ui/aurora-text";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { getManageableRoles } from "@/components/(base)/(users)/usuarios/lib/permissions";
import {
  MENSAJE_ERROR_CREAR_USUARIO,
  mensajeParaUsuario,
} from "@/lib/mensajes-usuario";
import {
  DEFAULT_SIGNUP_ROLE,
  extractRolesFromProfiles,
} from "@/components/(base)/(users)/usuarios/lib/helpers";
import { useUsers } from "@/components/(base)/(users)/usuarios/lib/hooks";
import { SelectorRol } from "@/components/(base)/(users)/usuarios/forms/SelectorRol";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import { toast } from "react-toastify";

const MENSAJE_CAMPOS_OBLIGATORIOS =
  "Complete los campos obligatorios antes de continuar.";

function SignUpCrearSubmitButton({
  actionPending,
  className,
}: {
  actionPending: boolean;
  className?: string;
}) {
  const { pending: formPending } = useFormStatus();
  const busy = formPending || actionPending;

  return (
    <SigetActionButton
      label={busy ? "Creando" : "Crear"}
      accentColor={sigetAccent.crear}
      morphFrom={UserPlusNode}
      morphTo={CheckNode}
      type="submit"
      loading={busy}
      ariaBusy={busy}
      ariaLabel={busy ? "Creando usuario" : "Crear usuario"}
      className={cn("h-9 w-full max-w-none", className)}
    />
  );
}

// Props
interface SignUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  presentation?: "modal" | "fullscreen";
}

// UI
const Label = ({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...props}
    className={cn(
      "text-sm font-semibold leading-none text-foreground/70",
      className,
    )}
  />
);

const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all outline-none",
      className,
    )}
  />
);

// Registro
export default function SignUp({
  isOpen,
  onClose,
  onSuccess,
  presentation = "modal",
}: SignUpProps) {
  const logic = useSignupLogic();
  const { effectiveRole } = useUserContext();
  const { data: users = [] } = useUsers(effectiveRole);
  const creatableRoles = useMemo(
    () => getManageableRoles(effectiveRole, extractRolesFromProfiles(users)),
    [effectiveRole, users],
  );
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [isUsernameEdited, setIsUsernameEdited] = useState(false);
  const [savedData, setSavedData] = useState({ user: "", pass: "" });
  const [submitStarted, setSubmitStarted] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const hasMovedToStep2 = useRef(false);
  const actionPending = logic.isPending || submitStarted;

  const fieldErrors = useMemo(
    () => ({
      ...(clientErrors ?? {}),
      ...(logic.state?.errors ?? {}),
    }),
    [clientErrors, logic.state?.errors],
  );

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const validated = authSchema.safeParse({
      name: logic.name,
      username: logic.username,
      password: logic.passwordValue,
      rol: logic.rol,
    });

    if (!validated.success) {
      event.preventDefault();
      setSubmitStarted(false);
      setClientErrors(validated.error.flatten().fieldErrors);
      toast.error(MENSAJE_CAMPOS_OBLIGATORIOS);
      return;
    }

    setClientErrors(null);
    setSubmitStarted(true);
  };

  const handleRolChange = useCallback(
    (newRol: string) => {
      logic.setRol(newRol);
    },
    [logic.setRol],
  );

  const suggestedUsername = useMemo(() => {
    if (logic.name.trim().length > 3) {
      const cleanName = logic.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z ]/g, "");
      const connectors = ["de", "del", "la", "las", "los", "y", "el"];
      const parts = cleanName
        .split(" ")
        .filter((p) => p.length > 0 && !connectors.includes(p));
      if (parts.length >= 2) {
        const initial = parts[0][0];
        const surname = parts.length >= 3 ? parts[2] : parts[1];
        return initial + surname;
      }
      if (parts.length === 1) {
        return parts[0];
      }
    }
    return "";
  }, [logic.name]);

  const resetForm = () => {
    logic.setName("");
    logic.setUsername("");
    logic.setPasswordValue(INITIAL_USER_PASSWORD);
    logic.setRol(DEFAULT_SIGNUP_ROLE);
    logic.setShowPassword(false);
    setPhoneNumber("");
    setCopied(false);
    setIsUsernameEdited(false);
    setStep(1);
    setSavedData({ user: "", pass: "" });
    setSubmitStarted(false);
    setClientErrors(null);
    hasMovedToStep2.current = false;
  };

  useEffect(() => {
    if (isOpen) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || presentation !== "fullscreen") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, presentation]);

  const isFullscreen = presentation === "fullscreen";

  useEffect(() => {
    if (logic.state?.success && !hasMovedToStep2.current) {
      setSavedData({ user: logic.username, pass: logic.passwordValue });
      hasMovedToStep2.current = true;
      setSubmitStarted(false);
      setStep(2);
      onSuccess?.();
    }
  }, [logic.state?.success, logic.username, logic.passwordValue, onSuccess]);

  useEffect(() => {
    if (!logic.isPending && !logic.state?.success) {
      setSubmitStarted(false);
    }
  }, [logic.isPending, logic.state?.success]);

  useEffect(() => {
    if (!logic.state?.errors) return;
    const hasFieldErrors = Object.values(logic.state.errors).some(
      (messages) => Array.isArray(messages) && messages.length > 0,
    );
    if (hasFieldErrors) {
      setSubmitStarted(false);
      toast.error(MENSAJE_CAMPOS_OBLIGATORIOS);
    }
  }, [logic.state?.errors]);

  const handleCopy = () => {
    const textToCopy = `*CREDENCIALES DE ACCESO*\n\n*Usuario:* ${savedData.user}\n*Contraseña:* ${savedData.pass}\n\n_Por seguridad, cambie su clave al ingresar_`;

    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
      }
    } catch (err) {
      console.error("Fallo al copiar:", err);
    }

    document.body.removeChild(textArea);
  };

  const handleWhatsApp = () => {
    if (phoneNumber.length === 8) {
      const msg = `*CREDENCIALES DE ACCESO*\n\n*Usuario:* ${savedData.user}\n*Contraseña:* ${savedData.pass}\n\n_Por seguridad, cambie su clave al ingresar._`;
      window.open(
        `https://wa.me/502${phoneNumber}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    }
  };

  if (!isOpen) return null;

  const card = (
    <MagicCard
      className={cn(
        "flex w-full flex-col overflow-hidden border border-border/50 bg-card shadow-none",
        isFullscreen
          ? "h-full min-h-0 max-h-dvh flex-1 rounded-none border-0 max-md:h-dvh"
          : "rounded-3xl",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-border/50 bg-muted/5 p-4 md:p-6",
          isFullscreen &&
            "bg-white pt-[max(0.75rem,env(safe-area-inset-top))] dark:bg-zinc-900 md:bg-muted/5 md:pt-6",
        )}
      >
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <UserPlus size={26} className="text-primary shrink-0" />
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
              Nuevo Usuario
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Configuración de acceso
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
          aria-label="Cerrar"
        >
          <X size={20} className="text-muted-foreground" />
        </button>
      </div>

      <div
        className={cn(
          "min-h-0 overflow-x-hidden custom-scrollbar",
          isFullscreen
            ? "flex flex-1 flex-col overflow-hidden"
            : "overflow-y-auto p-4 md:p-6 min-h-105 max-h-[min(70dvh,520px)]",
        )}
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              action={logic.formAction}
              onSubmit={handleFormSubmit}
              className={cn(
                isFullscreen
                  ? "flex min-h-0 flex-1 flex-col"
                  : "flex min-h-full flex-col gap-5",
              )}
            >
              <div
                className={cn(
                  isFullscreen
                    ? "min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 md:p-6"
                    : "flex flex-1 flex-col gap-5",
                )}
              >
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="ej. Juan Pérez"
                  value={logic.name}
                  onChange={(e) => {
                    logic.setName(e.target.value);
                    if (clientErrors?.name) {
                      setClientErrors((prev) => {
                        if (!prev) return null;
                        const next = { ...prev };
                        delete next.name;
                        return Object.keys(next).length > 0 ? next : null;
                      });
                    }
                  }}
                  className={cn(
                    fieldErrors.name &&
                      "border-destructive ring-1 ring-destructive",
                  )}
                />
                {fieldErrors.name?.[0] ? (
                  <p className="text-[10px] text-destructive font-bold px-1 italic">
                    {fieldErrors.name[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username" className="flex items-center gap-1 flex-wrap">
                  Usuario
                  {suggestedUsername && (
                    <>
                      <span className="text-muted-foreground font-normal ml-1 border-l border-border pl-2">
                        Sugerido:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          logic.setUsername(suggestedUsername);
                          setIsUsernameEdited(true);
                        }}
                        className="group/sug flex items-center gap-1.5 transition-opacity cursor-pointer"
                      >
                        <AuroraText className="text-sm font-black lowercase opacity-80 group-hover/sug:opacity-100 transition-opacity">
                          {suggestedUsername}
                        </AuroraText>
                        <Wand2
                          size={14}
                          className="text-primary/70 group-hover/sug:text-primary transition-all group-hover/sug:scale-110 rotate-15"
                        />
                      </button>
                    </>
                  )}
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="ej. jperz"
                  value={logic.username}
                  onChange={(e) => {
                    logic.setUsername(e.target.value);
                    if (!isUsernameEdited) setIsUsernameEdited(true);
                    if (clientErrors?.username) {
                      setClientErrors((prev) => {
                        if (!prev) return null;
                        const next = { ...prev };
                        delete next.username;
                        return Object.keys(next).length > 0 ? next : null;
                      });
                    }
                  }}
                  className={cn(
                    fieldErrors.username &&
                      "border-destructive ring-1 ring-destructive",
                  )}
                />
                {fieldErrors.username?.[0] ? (
                  <p className="text-[10px] text-destructive font-bold px-1 italic">
                    {fieldErrors.username[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rol">Rol</Label>
                <SelectorRol
                  value={logic.rol}
                  onChange={handleRolChange}
                  roleOptions={creatableRoles}
                  allowCustom={effectiveRole === "super"}
                  preferredRole={DEFAULT_SIGNUP_ROLE}
                  resetKey={isOpen}
                  inputClassName="focus-visible:ring-2 focus-visible:ring-ring"
                  selectClassName="appearance-none focus-visible:ring-2 focus-visible:ring-ring"
                  toggleClassName="border-border bg-background"
                />
                {fieldErrors.rol?.[0] ? (
                  <p className="text-[10px] text-destructive font-bold px-1 italic">
                    {fieldErrors.rol[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="flex items-center gap-1.5 animate-pulse">
                    <AuroraText className="text-sm font-bold">
                      {INITIAL_USER_PASSWORD}
                    </AuroraText>
                    <Wand2 size={14} className="text-primary rotate-15" />
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={logic.showPassword ? "text" : "password"}
                    value={logic.passwordValue}
                    readOnly
                    tabIndex={-1}
                    className={cn(
                      "pr-10 bg-muted/20 font-mono border-dashed transition-all cursor-default focus-visible:ring-0",
                      !logic.showPassword && "tracking-[0.15em]",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => logic.setShowPassword(!logic.showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1 cursor-pointer"
                  >
                    {logic.showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {fieldErrors.password?.[0] ? (
                  <p className="text-[10px] text-destructive font-bold px-1 italic">
                    {fieldErrors.password[0]}
                  </p>
                ) : null}
              </div>

              {logic.state?.message && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
                  <p className="text-xs text-destructive font-semibold">
                    {mensajeParaUsuario(
                      logic.state.message,
                      MENSAJE_ERROR_CREAR_USUARIO,
                    )}
                  </p>
                </div>
              )}

              </div>

              {!isFullscreen ? (
                <div className="mt-auto shrink-0 pt-2 md:pt-6">
                  <SignUpCrearSubmitButton actionPending={actionPending} />
                </div>
              ) : null}

              {isFullscreen ? (
                <div className="mt-auto flex w-full shrink-0 items-center justify-center border-t border-zinc-200/80 bg-zinc-100 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:border-zinc-700 dark:bg-zinc-800">
                  <SignUpCrearSubmitButton actionPending={actionPending} />
                </div>
              ) : null}
            </motion.form>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className={cn(
                isFullscreen
                  ? "flex min-h-0 flex-1 flex-col overflow-hidden"
                  : "flex min-h-full flex-col gap-5",
              )}
            >
              <div
                className={cn(
                  isFullscreen
                    ? "min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4"
                    : "flex flex-1 flex-col gap-6",
                )}
              >
              <div className="p-5 rounded-2xl border border-border/60 bg-muted/30 space-y-5">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                    Credenciales generadas
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline font-bold transition-all cursor-pointer"
                    >
                      <ClipboardCopy size={14} />
                      Copiar datos
                    </button>
                    <AnimatePresence>
                      {copied && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: -45, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded shadow-xl font-bold whitespace-nowrap z-10"
                        >
                          ¡Copiado!
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex flex-col gap-4 text-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase opacity-70">
                      Usuario:
                    </span>
                    <span className="text-sm font-bold">{savedData.user}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase opacity-70">
                      Contraseña:
                    </span>
                    <code className="text-sm font-mono text-foreground bg-background/80 px-2 py-1 rounded border border-border/40 tracking-wider shadow-sm">
                      {savedData.pass}
                    </code>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-[10px] uppercase font-black tracking-widest">
                  Enviar por WhatsApp
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Número de 8 dígitos"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 8),
                      )
                    }
                  />
                  <SigetActionButton
                    label="Enviar"
                    accentColor={sigetAccent.abrir}
                    morphFrom={SendNode}
                    morphTo={MessageCircleNode}
                    onClick={handleWhatsApp}
                    disabled={phoneNumber.length !== 8}
                    className="w-auto shrink-0"
                  />
                </div>
              </div>
              </div>

              {isFullscreen ? (
                <div className="mt-auto flex w-full shrink-0 items-center justify-center border-t border-zinc-200/80 bg-zinc-100 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:border-zinc-700 dark:bg-zinc-800">
                  <SigetActionButton
                    label="Volver"
                    accentColor={sigetAccent.cancelar}
                    morphFrom={ArrowLeftNode}
                    morphTo={ArrowLeftNode}
                    morphOnHover={false}
                    onClick={resetForm}
                    className="h-9 w-full max-w-none"
                  />
                </div>
              ) : (
                <div className="mt-auto shrink-0 pt-2 md:pt-6">
                  <SigetActionButton
                    label="Volver"
                    accentColor={sigetAccent.cancelar}
                    morphFrom={ArrowLeftNode}
                    morphTo={ArrowLeftNode}
                    morphOnHover={false}
                    onClick={resetForm}
                    className="h-9 w-full max-w-none"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MagicCard>
  );

  if (isFullscreen) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-[201] flex h-dvh w-full",
          "max-md:flex-col max-md:bg-zinc-100 max-md:dark:bg-zinc-900",
          "md:items-center md:justify-center md:overflow-y-auto md:bg-background/60 md:p-4 md:backdrop-blur-md",
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={cn(
            "relative flex min-h-0 w-full flex-col",
            "max-md:h-dvh max-md:max-h-dvh max-md:flex-1",
            "md:max-h-[min(42rem,calc(100dvh-2rem))] md:max-w-md md:flex-none",
          )}
        >
          {card}
        </motion.div>
      </motion.div>,
      document.body,
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md relative"
        >
          {card}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
