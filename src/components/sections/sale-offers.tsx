"use client";

import { MessageSquare, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { ContactOpenLink } from "@/components/contact-open-link";
import { ServiceOfferCard } from "@/components/services/service-offer-card";
import { Link } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
import type { LocalizedService } from "@/lib/services/store";

type SaleOffersProps = {
  offers: LocalizedService[];
  /** Accueil : aperçu + lien catalogue. Page : liste complète. */
  variant?: "home" | "page";
};

/** Catalogue public des offres à vendre (/a-vendre). */
export function SaleOffers({ offers, variant = "home" }: SaleOffersProps) {
  const t = useTranslations("sales");
  const isPage = variant === "page";
  const preview = isPage ? offers : offers.slice(0, 3);

  return (
    <section
      id={isPage ? undefined : "a-vendre"}
      aria-labelledby="sales-heading"
      className="relative scroll-mt-28 overflow-hidden bg-surface px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
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
                id="sales-heading"
                className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl"
              >
                {t("catalogTitle")}{" "}
                <span className="text-primary">{t("catalogTitleHighlight")}</span>
              </h1>
            ) : (
              <h2
                id="sales-heading"
                className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl"
              >
                {t("title")}{" "}
                <span className="text-primary">{t("titleHighlight")}</span>
              </h2>
            )}
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              {isPage ? t("catalogSubtitle") : t("subtitle")}
            </p>
          </Reveal>
        </div>

        <CelestialDivider className="mt-10 sm:mt-12" />

        {preview.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-3">
            {preview.map((offer, i) => (
              <Reveal key={offer.id} delay={0.12 + i * 0.05}>
                <ServiceOfferCard service={offer} i18nNamespace="sales" />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-14 sm:flex-row sm:gap-4">
            {!isPage ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-h-12 w-full max-w-sm sm:w-auto"
              >
                <Link href={routes.forSale}>{t("viewAll")}</Link>
              </Button>
            ) : null}
            <Button asChild size="lg" className="min-h-12 w-full max-w-sm sm:w-auto">
              <ContactOpenLink intent="buy">
                {isPage ? (
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                ) : (
                  <MessageSquare className="h-4 w-4" aria-hidden />
                )}
                {t("cta")}
              </ContactOpenLink>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
