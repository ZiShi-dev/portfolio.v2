"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { HeroBanner3D } from "@/components/sections/hero-banner-3d";

export function Journey() {
  const t = useTranslations("journey");

  return (
    <section
      id="parcours"
      aria-labelledby="journey-heading"
      className="relative scroll-mt-28 overflow-x-clip bg-background px-4 py-12 sm:px-6 sm:py-16"
    >
      <CelestialAtlas intensity="subtle" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div className="mx-auto w-full max-w-xl text-start">
          <Reveal variant="down">
            <span className="inline-block rounded-full border border-border-gold bg-surface-elevated/60 px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary sm:text-[11px]">
              {t("eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.05} variant="left">
            <h2
              id="journey-heading"
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              {t("title")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} variant="right">
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="min-w-0 w-full">
          <HeroBanner3D />
        </Reveal>
      </div>
    </section>
  );
}
