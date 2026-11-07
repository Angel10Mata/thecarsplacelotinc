"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  APP_HEADER_BRAND_MAIN,
  APP_HEADER_BRAND_SUB,
  APP_LOGO_OVERLAY_TAGLINE,
} from "@/lib/app-config";
import { AppLogo } from "./AppLogo";

type AnimacionLogoProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AnimacionLogo({ isOpen, onClose }: AnimacionLogoProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="fullscreen-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[1000000] flex cursor-pointer items-center justify-center overflow-hidden bg-zinc-950 p-4 lg:p-12"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_42%,rgba(220,38,38,0.28),transparent_62%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4),transparent_70%)]"
            aria-hidden
          />

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            type="button"
            className="absolute right-6 top-6 z-20 cursor-pointer rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:right-8 md:top-8"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </motion.button>

          <motion.div
            initial={{ scale: 1.08, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex select-none flex-col items-center justify-center gap-7 pointer-events-none md:gap-10"
          >
            <div className="overflow-hidden rounded-2xl border border-zinc-700/90 bg-zinc-900 shadow-2xl shadow-red-950/50 md:rounded-3xl">
              <AppLogo
                size={168}
                priority
                className="h-36 w-36 object-cover md:h-44 md:w-44"
              />
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-4xl font-black uppercase leading-none tracking-tight text-brand-bright md:text-5xl lg:text-6xl">
                {APP_HEADER_BRAND_MAIN.toUpperCase()}
              </p>
              <p className="text-3xl font-black uppercase leading-none tracking-tight text-zinc-500 md:text-4xl lg:text-5xl">
                {APP_HEADER_BRAND_SUB.toUpperCase()}
              </p>
            </div>

            <div className="h-1 w-20 rounded-full bg-brand-bright md:w-24" aria-hidden />

            <p className="max-w-[min(92vw,26rem)] text-center text-base font-medium leading-relaxed text-zinc-300 md:max-w-xl md:text-lg">
              {APP_LOGO_OVERLAY_TAGLINE}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
