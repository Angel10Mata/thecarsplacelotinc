"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import AnimacionLogo from "./AnimacionLogo";
import { AppLogo } from "./AppLogo";

export default function AppLogoLogin() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsFullScreen(true)}
        whileTap={{ scale: 0.96 }}
        className="relative flex w-full cursor-pointer items-center justify-center border-0 bg-transparent p-0"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 50, damping: 16 }}
      >
        <AppLogo size={140} priority className="w-[min(70vw,140px)] h-auto" />
      </motion.button>

      {mounted &&
        createPortal(
          <AnimacionLogo
            isOpen={isFullScreen}
            onClose={() => setIsFullScreen(false)}
          />,
          document.body,
        )}
    </>
  );
}
