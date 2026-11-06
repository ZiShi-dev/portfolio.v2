"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type AnimatedStarRatingProps = {
  rating: number;
  className?: string;
  starClassName?: string;
  delay?: number;
};

export function AnimatedStarRating({
  rating,
  className,
  starClassName,
  delay = 0,
}: AnimatedStarRatingProps) {
  const t = useTranslations("reviews");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduceMotion = useReducedMotion();
  const safeRating = Math.min(5, Math.max(0, Math.round(rating)));
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    if (!inView || safeRating === 0) return;

    let current = 0;
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      setFilled(0);
      interval = window.setInterval(() => {
        current += 1;
        setFilled(current);
        if (current >= safeRating) {
          window.clearInterval(interval);
        }
      }, 160);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [inView, safeRating, reduceMotion, delay]);

  const displayedFilled =
    reduceMotion || safeRating === 0 ? safeRating : Math.min(filled, safeRating);

  return (
    <div ref={ref} className={cn("flex gap-1", className)} aria-label={t("stars", { rating: safeRating })}>
      {[1, 2, 3, 4, 5].map((value) => {
        const active = value <= displayedFilled;

        return (
          <motion.span
            key={value}
            initial={reduceMotion ? false : { scale: 0.5, opacity: 0.25 }}
            animate={
              active
                ? { scale: 1, opacity: 1 }
                : { scale: 0.85, opacity: 0.35 }
            }
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Star
              className={cn(
                "h-4 w-4",
                active
                  ? "fill-primary text-primary"
                  : "text-muted-foreground",
                starClassName
              )}
              aria-hidden
            />
          </motion.span>
        );
      })}
    </div>
  );
}
