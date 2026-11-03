"use client";

import { AppLogo } from "@/components/(base)/brand/AppLogo";
import { MapPin, Phone, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { publicSectionSurface } from "./public-section-surfaces";

// Sección nosotros (landing)
export function AboutSection() {
  return (
    <section
      id="about"
      className={cn(
        "min-h-screen lg:h-screen w-full snap-start flex flex-col items-center justify-start lg:justify-center px-6 pt-28 lg:pt-0 overflow-hidden",
        publicSectionSurface.about,
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        className="text-center mb-10 lg:mb-16 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Info className="size-3" />
            About Us
          </span>
        </div>
        <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic text-foreground leading-none">
          About Us
        </h2>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center w-full max-w-6xl pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
          className="relative aspect-square w-full max-w-80 lg:max-w-112.5 mx-auto"
        >
          <div className="flex h-full w-full items-center justify-center rounded-4xl border border-border/50 bg-card p-6">
            <AppLogo size={280} priority className="w-full h-auto max-h-full" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
          className="space-y-6 lg:space-y-8 text-center lg:text-left"
        >
          <p className="text-muted-foreground text-base lg:text-lg font-medium leading-relaxed italic">
            At The Cars Place Lot INC, we build trust through transparency.
            Every unit is documented for your peace of mind.
          </p>
          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-5 rounded-3xl bg-card/30 border border-border/50">
              <MapPin className="size-5 text-primary shrink-0" />
              <p className="text-sm lg:text-lg font-bold uppercase text-foreground leading-tight">
                3651 Danbury Road, Brewster, NY 10509
              </p>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-3xl bg-card/30 border border-border/50">
              <Phone className="size-5 text-primary shrink-0" />
              <p className="text-xl lg:text-2xl font-mono font-black text-foreground">
                +1 (845) 309-7936
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
