"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { ContactOpenLink } from "@/components/contact-open-link";
import { CatalogProjectLinkCard } from "@/components/services/catalog-project-link-card";
import { ServiceOfferCard } from "@/components/services/service-offer-card";
import { Link } from "@/i18n/navigation";
import type { LocalizedProjectItem } from "@/data/projects";
import { routes } from "@/lib/routes";
import type { LocalizedService } from "@/lib/services/store";

type ServicesProps = {
  services: LocalizedService[];
  /** Projets liés en exemple : perso, vendus, ou à vendre. */
  projects?: LocalizedProjectItem[];
  /** Accueil : aperçu + lien catalogue. Page : liste complète. */
  variant?: "home" | "page";
};

/**
 * Section Services — prestations que VORZIX peut fournir,
 * avec liens vers des projets (perso / vendu / à vendre).
 * Distinct de la section Sites à vendre.
 */
export function Services({
  services,
  projects = [],
  variant = "home",
}: ServicesProps) {
  const t = useTranslations("services");
  const isPage = variant === "page";

  const previewServices = isPage ? services : services.slice(0, 6);
  const previewProjects = isPage ? projects : projects.slice(0, 6);
  const hasContent = previewServices.length > 0 || previewProjects.length > 0;

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

        {!hasContent ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="mt-10 space-y-14 sm:mt-12 lg:mt-14">
            {previewServices.length > 0 ? (
              <div>
                <Reveal delay={0.12}>
                  <h3 className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    {t("servicesHeading")}
                  </h3>
                </Reveal>
                <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {previewServices.map((service, i) => (
                    <Reveal key={service.id} delay={0.12 + i * 0.05}>
                      <ServiceOfferCard service={service} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ) : null}

            {previewProjects.length > 0 ? (
              <div>
                <Reveal delay={0.12}>
                  <div className="mx-auto max-w-2xl text-center">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                      {t("projectLinksHeading")}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("projectLinksSubtitle")}
                    </p>
                  </div>
                </Reveal>
                <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {previewProjects.map((project, i) => (
                    <Reveal key={project.id} delay={0.12 + i * 0.05}>
                      <CatalogProjectLinkCard project={project} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ) : null}
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
