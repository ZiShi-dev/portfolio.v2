"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { TechStrip } from "@/components/sections/tech-strip";
import { HeroHeadline } from "@/components/sections/hero-headline";
import { HeroBanner } from "@/components/sections/hero-banner";
import { Link } from "@/i18n/navigation";
import { homeAnchors, routes } from "@/lib/routes";

const enterEase = [0.22, 1, 0.36, 1] as const;

export function HomeSection() {
  const t = useTranslations("home");
  const reduceMotion = useReducedMotion();

  const enterTransition = {
    duration: reduceMotion ? 0.2 : 0.6,
    ease: enterEase,
  };

  return (
    <section
      id="accueil"
      className="relative flex min-h-0 w-full max-w-[100vw] flex-col overflow-x-clip bg-background sm:min-h-[100dvh]"
    >
      {/* Atlas discret : ne doit pas concurrencer / flouter la bannière */}
      <CelestialAtlas intensity="subtle" className="-z-10 opacity-25" />

      {/* Plein viewport — hors padding du contenu */}
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0.25 : 0.85,
          delay: reduceMotion ? 0 : 0.04,
          ease: enterEase,
        }}
        className="pointer-events-none absolute inset-0 z-0 w-full"
      >
        <HeroBanner variant="concave" className="h-full w-full" />
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 pb-10 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
        <div className="relative z-10 mx-auto mt-[min(28vw,11rem)] flex w-full max-w-3xl flex-col items-center text-center sm:mt-[min(22vw,13rem)]">
          <HeroHeadline />

          <motion.div
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 24, filter: "blur(6px)" }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            transition={{
              ...enterTransition,
              delay: reduceMotion ? 0 : 0.28,
            }}
            className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3"
          >
            <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
              <Link href={routes.startProject}>{t("contact")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12 w-full sm:w-auto"
            >
              <Link href={routes.projects}>{t("projects")}</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              ...enterTransition,
              delay: reduceMotion ? 0 : 0.38,
            }}
            className="mt-4 max-w-lg text-center text-xs leading-relaxed text-muted-foreground sm:mt-5 lg:text-sm"
          >
            <span className="font-mono text-[10px] tracking-[0.18em] text-primary/70">
              CAT. VZ—HOME
            </span>
            <span className="mx-2 text-border-gold">·</span>
            {t("trustLine")}
          </motion.p>
        </div>

        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...enterTransition, delay: reduceMotion ? 0 : 0.45 }}
          className="relative z-10"
        >
          <a
            href={homeAnchors.services}
            className="mx-auto mt-8 flex min-h-11 flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-10"
            aria-label={t("scroll")}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
              {t("scroll")}
            </span>
            <ArrowDown
              className={`h-4 w-4 ${reduceMotion ? "" : "motion-safe:animate-[fade-nudge_2.4s_ease-in-out_infinite]"}`}
              aria-hidden
            />
          </a>
        </motion.div>
      </div>

      <Reveal delay={0.1}>
        <TechStrip />
      </Reveal>
    </section>
  );
}
