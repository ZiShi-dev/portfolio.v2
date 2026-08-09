"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

const enterEase = [0.22, 1, 0.36, 1] as const;

export function HeroHeadline() {
  const t = useTranslations("hero");
  const reduceMotion = useReducedMotion();

  const enter = (delay: number) => ({
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(6px)" },
    animate: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: {
      duration: reduceMotion ? 0.2 : 0.65,
      delay: reduceMotion ? 0 : delay,
      ease: enterEase,
    },
  });

  return (
    <div className="flex w-full flex-col items-center text-center">
      <motion.span
        {...enter(0)}
        className="inline-flex items-center rounded-full border border-border-gold bg-surface-elevated/70 px-3.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary backdrop-blur-sm sm:text-[11px]"
      >
        {t("eyebrow")}
      </motion.span>

      <motion.h1
        {...enter(0.08)}
        className="mt-4 max-w-2xl font-display text-[1.85rem] font-semibold leading-[1.08] tracking-tight text-foreground drop-shadow-[0_2px_24px_rgba(7,10,18,0.85)] sm:mt-5 sm:text-5xl sm:leading-[1.05] lg:text-[3.25rem]"
      >
        {t("title")}{" "}
        <span className="text-primary">{t("titleHighlight")}</span>
      </motion.h1>

      <motion.p
        {...enter(0.16)}
        className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground drop-shadow-[0_2px_16px_rgba(7,10,18,0.9)] sm:mt-6 sm:text-lg"
      >
        {t("subtitle")}
      </motion.p>
    </div>
  );
}
