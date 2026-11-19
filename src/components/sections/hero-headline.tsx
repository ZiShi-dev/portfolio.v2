"use client";

import { useTranslations } from "next-intl";

export function HeroHeadline() {
  const t = useTranslations("hero");

  return (
    <div className="flex w-full flex-col items-center text-center">
      <h1
        className="max-w-[19ch] text-balance font-display text-[clamp(2rem,5vw,4.25rem)] font-semibold leading-[1.12] tracking-tight text-foreground drop-shadow-[0_2px_24px_rgba(7,10,18,0.85)]"
      >
        {t("title")}{" "}
        {t("titleHighlight")}
      </h1>

      <p className="mt-3 font-display text-sm italic text-primary drop-shadow-[0_2px_16px_rgba(7,10,18,0.9)] sm:text-base">
        {t("brandLine")}
      </p>

      <p
        className="mt-4 max-w-[48ch] text-pretty text-base leading-relaxed text-foreground/85 drop-shadow-[0_2px_16px_rgba(7,10,18,0.9)] sm:mt-5 sm:text-lg"
      >
        {t("subtitle")}
      </p>
    </div>
  );
}
