"use client";

import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
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
import { cn } from "@/lib/utils";

type CatalogFilter = "all" | "product" | "service";

type ServicesProps = {
  services: LocalizedService[];
  /** Accueil : aperçu + lien catalogue. Page : liste complète + filtres. */
  variant?: "home" | "page";
};

export function Services({ services, variant = "home" }: ServicesProps) {
  const t = useTranslations("services");
  const isPage = variant === "page";
  const [filter, setFilter] = useState<CatalogFilter>("all");

  const filtered = useMemo(() => {
    if (!isPage || filter === "all") return services;
    return services.filter((s) => s.offerKind === filter);
  }, [filter, isPage, services]);

  const filters: { id: CatalogFilter; label: string }[] = [
    { id: "all", label: t("filter.all") },
    { id: "product", label: t("filter.product") },
    { id: "service", label: t("filter.service") },
  ];

  return (
    <section
      id={isPage ? undefined : "services"}
      aria-labelledby="services-heading"
      className="relative scroll-mt-28 overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
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
              {isPage ? t("catalogSubtitle") : t("subtitle")}
            </p>
          </Reveal>
        </div>

        <CelestialDivider className="mt-10 sm:mt-12" />

        {isPage ? (
          <Reveal delay={0.12}>
            <div
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
              role="tablist"
              aria-label={t("filter.label")}
            >
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "min-h-10 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                    filter === f.id
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Reveal>
        ) : null}

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {services.length === 0 ? t("empty") : t("filter.empty")}
          </p>
        ) : (
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-3">
            {filtered.map((service, i) => (
              <Reveal key={service.id} delay={0.12 + i * 0.05}>
                <ServiceOfferCard service={service} />
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
