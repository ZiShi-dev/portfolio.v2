"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { CelestialPageSplash } from "@/components/celestial-page-loader";

/** Transition d’entrée au changement de route (via `template.tsx`). */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <>
    <CelestialPageSplash />
    <motion.div
      initial={reduceMotion ? false : { opacity: 0.85 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
    </>
  );
}
