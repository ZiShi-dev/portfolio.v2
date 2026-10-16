"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroHeadline } from "@/components/sections/hero-headline";
import { HeroBanner } from "@/components/sections/hero-banner";
import { Link } from "@/i18n/navigation";
import { homeAnchors, routes } from "@/lib/routes";

export function HomeSection() {
  const t = useTranslations("home");
  const imageRef = useRef<HTMLImageElement>(null);
  const [artReady, setArtReady] = useState(false);

  useEffect(() => {
    let active = true;
    const ready = () => { if (active) setArtReady(true); };
    const image = imageRef.current;
    if (image) void image.decode().then(ready, ready);
    else ready();
    // Keep the page usable even if the artwork is slow or unavailable.
    const timeout = window.setTimeout(ready, 700);
    return () => { active = false; window.clearTimeout(timeout); };
  }, []);

  return (
    <section
      id="accueil"
      data-art-ready={artReady ? "true" : "false"}
      className="hero-with-artwork hero-cinematic relative flex w-full max-w-[100vw] flex-col overflow-x-clip bg-background"
    >
      <div className="hero-responsive-visual pointer-events-none absolute inset-x-0 top-0 z-0 w-full">
        <HeroBanner imageRef={imageRef} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 pb-10 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
        <div className="relative z-10 mx-auto mt-[min(28vw,11rem)] flex w-full max-w-3xl flex-col items-center text-center sm:mt-[min(22vw,13rem)]">
          <div className="hero-water-emergence w-full">
            <HeroHeadline />
          </div>

          <div className="hero-arrival-actions mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
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
          </div>

          <p className="hero-arrival-trust mt-4 max-w-lg text-center text-xs leading-relaxed text-muted-foreground sm:mt-5 lg:text-sm">
            <span className="font-mono text-[10px] tracking-[0.18em] text-primary/70">
              CAT. VZ—HOME
            </span>
            <span className="mx-2 text-border-gold">·</span>
            {t("trustLine")}
          </p>
        </div>

        <div className="hero-arrival-scroll relative z-10">
          <a
            href={homeAnchors.services}
            className="mx-auto mt-8 flex min-h-11 flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-10"
            aria-label={t("scroll")}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
              {t("scroll")}
            </span>
            <ArrowDown
              className="h-4 w-4 motion-safe:animate-[fade-nudge_2.4s_ease-in-out_infinite]"
              aria-hidden
            />
          </a>
        </div>
      </div>
    </section>
  );
}
