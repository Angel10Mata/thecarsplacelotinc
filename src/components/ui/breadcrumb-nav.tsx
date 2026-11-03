"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { APP_BASE_PATH } from "@/lib/app-config";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const SEGMENT_LABELS: Record<string, string> = {
  TheCarsPlace: "THE CARS PLACE LOT INC",
  vehiculos: "Vehículos",
  inventario: "Inventario",
  clientes: "Clientes",
  cliente: "Clientes",
  detalles: "Detalles",
  reporteria: "Reportería",
  admin: "Administración",
  usuarios: "Gestión de Usuarios",
  configuraciones: "Configuraciones",
  perfil: "Mi Perfil",
  nuevo: "Nuevo",
  editar: "Editar",
  ver: "Ver",
};

const SEGMENT_HREF: Partial<Record<string, string>> = {
  cliente: `${APP_BASE_PATH}/clientes`,
};

export function BreadcrumbNav() {
  const pathname = usePathname();

  if (pathname === APP_BASE_PATH || pathname === `${APP_BASE_PATH}/`) {
    return null;
  }

  const rawSegments = pathname.split("/").filter((item) => item !== "");

  const visibleSegments = rawSegments
    .map((segment, index) => {
      const label = SEGMENT_LABELS[segment];
      if (!label) return null;

      const parts = rawSegments.slice(0, index + 1);
      let nextIdx = index + 1;
      while (nextIdx < rawSegments.length && !SEGMENT_LABELS[rawSegments[nextIdx]]) {
        parts.push(rawSegments[nextIdx]);
        nextIdx++;
      }
      const href = SEGMENT_HREF[segment] ?? "/" + parts.join("/");

      return { segment, label, href };
    })
    .filter((item): item is { segment: string; label: string; href: string } => item !== null);

  return (
    <LayoutGroup id="breadcrumb">
      <motion.div
        layout
        className="flex items-center gap-2 text-[9px] md:text-sm font-medium text-muted-foreground overflow-hidden pt-1"
      >
        <div className="flex items-center gap-1 overflow-hidden mask-gradient">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleSegments.map((item, index) => {
              const isLast = index === visibleSegments.length - 1;

              return (
                <motion.div
                  layout="position"
                  key={item.href}
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.15 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                    mass: 1,
                  }}
                  className="flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                  {index > 0 ? (
                    <ChevronRight className="size-4 md:size-5 text-muted-foreground/40 shrink-0" />
                  ) : null}
                  <Link
                    href={item.href}
                    className={`capitalize hover:text-foreground transition-colors truncate ${
                      isLast
                        ? "text-foreground underline underline-offset-4 pointer-events-none text-[10px] md:text-base"
                        : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </LayoutGroup>
  );
}
