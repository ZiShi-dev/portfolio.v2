"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { ContactOpenLink } from "@/components/contact-open-link";
import { ServiceOfferCard } from "@/components/services/service-offer-card";
import { Link } from "@/i18n/navigation";
import { getHomeGridClass, HOME_SECTION_PREVIEW } from "@/lib/home-layout";
import { routes, serviceDetailPath } from "@/lib/routes";
import type { LocalizedService } from "@/lib/services/store";
import { cn } from "@/lib/utils";

type ServicesProps = {
  services: LocalizedService[];
  /** Accueil : aperçu + lien catalogue. Page : liste complète. */
  variant?: "home" | "page";
};

export function Services({ services, variant = "home" }: ServicesProps) {
  const t = useTranslations("services");
  const isPage = variant === "page";
  const preview = isPage
    ? services
    : services.slice(0, HOME_SECTION_PREVIEW);
  const rest = isPage ? [] : services.slice(HOME_SECTION_PREVIEW);
  const hasMore = rest.length > 0;

  return (
    <section
      id={isPage ? undefined : "services"}
      aria-labelledby="services-heading"
      className={
        isPage
          ? "relative overflow-hidden bg-background px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-10 lg:pb-28"
          : "relative scroll-mt-28 overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
      }
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
            {isPage ? (
              <h1
                id="services-heading"
                className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl"
              >
                {t("catalogTitle")}{" "}
                <span className="text-primary">{t("catalogTitleHighlight")}</span>
              </h1>
            ) : (
              <h2
                id="services-heading"
                className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl"
              >
                {t("title")}{" "}
                <span className="text-primary">{t("titleHighlight")}</span>
              </h2>
            )}
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              {isPage
                ? t("catalogSubtitle")
                : t.has("homeSubtitle")
                  ? t("homeSubtitle")
                  : t("subtitle")}
            </p>
          </Reveal>
        </div>

        <CelestialDivider className="mt-10 sm:mt-12" />

        {services.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <>
            <div
              className={cn(
                "mx-auto mt-10 grid max-w-6xl gap-3 sm:mt-12 sm:gap-5 lg:mt-14",
                isPage
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : getHomeGridClass(preview.length)
              )}
            >
              {preview.map((service, i) => (
                <Reveal key={service.id} delay={0.04 + Math.min(i, 5) * 0.04}>
                  <ServiceOfferCard service={service} compact={!isPage} />
                </Reveal>
              ))}
            </div>

            {hasMore ? (
              <Reveal delay={0.16}>
                <div className="mx-auto mt-8 max-w-3xl text-center sm:mt-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">
                    {t.has("otherOffers") ? t("otherOffers") : t("viewAll")}
                  </p>
                  <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
                    {rest.map((service, i) => (
                      <li
                        key={service.id}
                        className="flex items-center text-muted-foreground"
                      >
                        {i > 0 ? (
                          <span
                            className="mx-2 text-border-gold/80"
                            aria-hidden
                          >
                            ·
                          </span>
                        ) : null}
                        <Link
                          href={serviceDetailPath(service.slug)}
                          className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          {service.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}
          </>
        )}

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-14 sm:flex-row sm:gap-4">
            {!isPage && hasMore ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-h-12 w-full max-w-sm sm:w-auto"
              >
                <Link href={routes.services}>{t("viewAll")}</Link>
              </Button>
            ) : null}
            <Button asChild size="lg" className="min-h-12 w-full max-w-sm sm:w-auto">
              <ContactOpenLink>
                <MessageSquare className="h-4 w-4" aria-hidden />
                {t("cta")}
              </ContactOpenLink>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
