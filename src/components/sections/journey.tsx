"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { HeroBanner3D } from "@/components/sections/hero-banner-3d";

export function Journey() {
  const t = useTranslations("journey");

  return (
    <section
      id="parcours"
      aria-labelledby="journey-heading"
      className="relative scroll-mt-28 overflow-x-clip bg-surface px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
    >
      <CelestialAtlas intensity="subtle" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-block rounded-full border border-border-gold bg-surface-elevated/60 px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary sm:text-[11px]">
              {t("eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              id="journey-heading"
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl"
            >
              {t("title")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        <CelestialDivider className="mt-8 sm:mt-10" />

        <Reveal delay={0.15}>
          <div className="mx-auto mt-8 max-w-xl sm:mt-12 sm:max-w-2xl lg:max-w-3xl">
            <HeroBanner3D />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
