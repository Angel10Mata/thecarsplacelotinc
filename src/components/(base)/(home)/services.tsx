"use client"

import { Globe, ShieldCheck, Truck, Zap } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { publicSectionSurface } from "./public-section-surfaces"

const servicesViewport = { once: true, amount: 0.2 } as const

// Sección servicios (landing)
export function ServicesSection() {
  const reduceMotion = useReducedMotion()
  const motionDuration = reduceMotion ? 0 : undefined

  const services = [
    { title: "Vehicle Sales", desc: "Certified pre-owned units with full transparency.", icon: ShieldCheck, color: "from-blue-500 to-cyan-400" },
    { title: "Global Import", desc: "Expert logistics and legal documentation for imports.", icon: Globe, color: "from-purple-500 to-pink-500" },
    { title: "Local Support", desc: "Direct support at our Brewster facility.", icon: Truck, color: "from-orange-500 to-red-500" }
  ]

  return (
    <section
      id="services"
      className={cn(
        "min-h-[100dvh] min-h-screen w-full snap-start flex flex-col items-center justify-start px-6 pt-28 pb-10 lg:h-screen lg:justify-center lg:pt-0 lg:pb-10 overflow-x-hidden overflow-y-visible",
        publicSectionSurface.services,
      )}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={servicesViewport}
        transition={{ duration: motionDuration ?? 0.55, ease: "easeOut" }}
        className="text-center mb-12 lg:mb-16 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Zap className="size-3 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Services</span>
        </div>
        <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic text-foreground leading-none">Our Services</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl w-full pb-10">
        {services.map((s, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={servicesViewport}
            transition={{
              duration: motionDuration ?? 0.45,
              ease: "easeOut",
              delay: reduceMotion ? 0 : 0.08 + idx * 0.08,
            }}
            className="group relative rounded-4xl border border-border/55 bg-card/35 p-8 shadow-sm backdrop-blur-xl transition-all dark:border-zinc-700/80 dark:bg-zinc-800/55 lg:p-10"
          >
            <div className={`size-14 lg:size-16 rounded-2xl bg-linear-to-br ${s.color} flex items-center justify-center mb-6 lg:mb-8 shadow-lg`}>
              <s.icon className="size-6 lg:size-8 text-white" />
            </div>
            <h3 className="text-xl lg:text-2xl font-black mb-4 uppercase text-foreground">{s.title}</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}