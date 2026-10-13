"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function Reveal({
  children,
  delay = 0,
  className,
  variant = "rise",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "rise" | "fade";
}) {
  const reduceMotion = useReducedMotion();
  const activeVariants = reduceMotion || variant === "fade" ? reducedVariants : variants;

  return (
    <motion.div
      className={className}
      variants={activeVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.05, margin: "0px 0px 64px 0px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
