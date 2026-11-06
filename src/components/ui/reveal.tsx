"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "rise" | "fade" | "left" | "right" | "down";
const origins: Record<RevealVariant, { x: number; y: number }> = {
  rise: { x: 0, y: 28 },
  fade: { x: 0, y: 0 },
  left: { x: -32, y: 0 },
  right: { x: 32, y: 0 },
  down: { x: 0, y: -24 },
};

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
  /**
   * `inView` — au scroll (sections longues).
   * `mount` — une seule fois au premier rendu (grille / liste : stagger sans rejouer au scroll).
   */
  trigger?: "inView" | "mount";
  /** Si false, pas d’animation (contenu visible directement). */
  animate?: boolean;
};

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Entrée au scroll via le viewport (pas via scrollYProgress global).
 * L’ancienne approche laissait scrollYProgress à 0 au premier rendu : tout le bloc
 * restait à opacity 0 pendant que le footer (hors Reveal) s’affichait seul.
 */
function InViewReveal({
  children,
  delay = 0,
  className,
  variant = "rise",
}: Omit<RevealProps, "trigger" | "animate">) {
  const origin = origins[variant];
  const stagger = Math.min(Math.max(delay, 0), 0.35);
  return (
    <motion.div
      className={cn("scroll-reveal", className)}
      data-reveal-direction={variant}
      initial={{ opacity: 0, x: origin.x, y: origin.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: 0.42,
        ease: REVEAL_EASE,
        delay: stagger,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger au premier paint uniquement (pas d’IntersectionObserver). */
function MountReveal({
  children,
  delay = 0,
  className,
  variant = "rise",
}: Omit<RevealProps, "trigger" | "animate">) {
  const origin = origins[variant];
  const stagger = Math.min(Math.max(delay, 0), 0.35);
  return (
    <motion.div
      className={cn("scroll-reveal", className)}
      data-reveal-direction={variant}
      data-reveal-trigger="mount"
      initial={{ opacity: 0, x: origin.x, y: origin.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.28,
        ease: REVEAL_EASE,
        delay: stagger,
      }}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  trigger = "inView",
  animate = true,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  // Mount no scroll observer when the visitor requests reduced motion.
  if (reduceMotion || !animate)
    return <div className={props.className}>{props.children}</div>;
  if (trigger === "mount") return <MountReveal {...props} />;
  return <InViewReveal {...props} />;
}
