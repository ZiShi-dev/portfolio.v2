"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
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
};

/** Native scroll progress drives the entrance in both directions, without a timed tween. */
function ScrollReveal({ children, delay = 0, className, variant = "rise" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 96%", "start 62%"] });
  // Existing stagger values now offset scroll progress instead of adding a time delay.
  const start = Math.min(Math.max(delay, 0), 0.24);
  const opacity = useTransform(scrollYProgress, [start, 1], [0, 1]);
  const x = useTransform(scrollYProgress, [start, 1], [origins[variant].x, 0]);
  const y = useTransform(scrollYProgress, [start, 1], [origins[variant].y, 0]);
  return (
    <motion.div ref={ref} className={cn("scroll-reveal", className)} data-reveal-direction={variant}
      initial={false} style={{ opacity, x, y }}>
      {children}
    </motion.div>
  );
}

export function Reveal(props: RevealProps) {
  const reduceMotion = useReducedMotion();
  // Mount no scroll observer when the visitor requests reduced motion.
  if (reduceMotion) return <div className={props.className}>{props.children}</div>;
  return <ScrollReveal {...props} />;
}
