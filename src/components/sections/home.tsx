"use client";

import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroHeadline } from "@/components/sections/hero-headline";
import { HeroBanner } from "@/components/sections/hero-banner";
import { Link } from "@/i18n/navigation";
import { homeAnchors, routes } from "@/lib/routes";

export function HomeSection() {
  const t = useTranslations("home");

  return (
    <section
      id="accueil"
      className="hero-with-artwork hero-cinematic relative flex w-full max-w-[100vw] flex-col overflow-x-clip bg-background"
    >
      <div className="hero-responsive-visual pointer-events-none absolute inset-x-0 top-0 z-0 w-full">
        <HeroBanner />
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
              className="min-h-12 w-full bg-background/75 sm:w-auto"
            >
              <Link href={routes.projects}>{t("projects")}</Link>
            </Button>
          </div>

          <ul className="hero-arrival-trust mt-5 flex max-w-3xl flex-col items-center gap-1.5 text-sm text-foreground/90 drop-shadow-[0_2px_16px_rgba(7,10,18,0.9)] sm:flex-row sm:flex-wrap sm:justify-center sm:gap-0">
            {t("trustLine")
              .split(" · ")
              .map((fact) => fact.trim())
              .filter(Boolean)
              .map((fact, index) => (
                <li key={fact} className="flex items-center">
                  {index > 0 ? (
                    <span
                      className="mx-3 hidden h-3 w-px bg-foreground/30 sm:block"
                      aria-hidden
                    />
                  ) : null}
                  {fact}
                </li>
              ))}
          </ul>
        </div>

        <div className="hero-arrival-scroll relative z-10">
          <a
            href={homeAnchors.services}
            className="mx-auto mt-8 flex min-h-11 flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-10"
            aria-label={t("scroll")}
          >
            <span className="text-sm font-medium">
              {t("scroll")}
            </span>
            <ArrowDown className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
