"use client";

import { useTranslations } from "next-intl";

export function HeroHeadline() {
  const t = useTranslations("hero");

  return (
    <div className="flex w-full flex-col items-center text-center">
      <span
        className="inline-flex items-center rounded-full border border-border-gold bg-surface-elevated/70 px-3.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary backdrop-blur-sm sm:text-[11px]"
      >
        {t("eyebrow")}
      </span>

      <h1
        className="mt-4 max-w-2xl font-display text-[1.85rem] font-semibold leading-[1.08] tracking-tight text-foreground drop-shadow-[0_2px_24px_rgba(7,10,18,0.85)] sm:mt-5 sm:text-5xl sm:leading-[1.05] lg:text-[3.25rem]"
      >
        {t("title")}{" "}
        <span className="text-primary">{t("titleHighlight")}</span>
      </h1>

      <p
        className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground drop-shadow-[0_2px_16px_rgba(7,10,18,0.9)] sm:mt-6 sm:text-lg"
      >
        {t("subtitle")}
      </p>
    </div>
  );
}
