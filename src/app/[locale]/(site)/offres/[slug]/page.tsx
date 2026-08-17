import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Check, MessageSquare } from "lucide-react";
import { ContactOpenLink } from "@/components/contact-open-link";
import { Button } from "@/components/ui/button";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { brand } from "@/lib/brand";
import {
  createPageMetadata,
  routes,
  serviceDetailPath,
} from "@/lib/routes";
import { ServiceIcon } from "@/lib/services/icons";
import { resolveServicePriceDisplay } from "@/lib/services/pricing";
import {
  getLinkedProjectsForService,
  getSiteServiceBySlug,
  getSiteServices,
} from "@/lib/services/site";
import { getSiteFaqsForService } from "@/lib/faqs/site";
import { FaqSection } from "@/components/sections/faq";
import { ServiceLinkedProjectCard } from "@/components/services/service-linked-project-card";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const services = await getSiteServices("fr");
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getSiteServiceBySlug(locale as Locale, slug);
  if (!service) {
    return { robots: { index: false, follow: false } };
  }

  const title = service.seoTitle || `${service.title} — ${brand.name}`;
  const description =
    service.seoDescription || service.shortDescription || brand.description;

  return createPageMetadata({
    title,
    description,
    path: serviceDetailPath(service.slug),
  });
}

/** Page détail d’une offre — « en savoir plus » */
export default async function OffreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("services");
  const service = await getSiteServiceBySlug(locale, slug);
  if (!service) notFound();

  const price = resolveServicePriceDisplay({
    pricingMode: service.pricingMode,
    startingPriceCents: service.startingPriceCents,
    currency: service.currency,
    locale,
    labels: {
      startingAt: (amount) => t("pricing.startingAt", { price: amount }),
      fixed: (amount) => t("pricing.fixed", { price: amount }),
      contact: t("pricing.contact"),
    },
  });

  const linkedProjects = await getLinkedProjectsForService(service, locale);
  const startLabel = service.ctaLabel.trim() || t("ctaStart");
  const faqs = await getSiteFaqsForService(locale, service.id);

  return (
    <main
      id="main-content"
      className="relative min-h-dvh overflow-hidden bg-background"
    >
      <CelestialAtlas intensity="subtle" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Link
          href={routes.services}
          className="inline-flex min-h-10 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          {t("backToCatalog")}
        </Link>

        <header className="mt-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/70">
              {service.reference}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {service.title}
            </h1>
            {price.mode === "starting_at" || price.mode === "fixed" ? (
              <p className="mt-4 font-mono text-lg tracking-wide text-primary sm:text-xl">
                {price.label}
              </p>
            ) : null}
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border text-primary sm:h-14 sm:w-14"
            aria-hidden
          >
            <ServiceIcon name={service.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </header>

        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {service.shortDescription}
        </p>

        <CelestialDivider className="mt-10" />

        {service.description &&
        service.description !== service.shortDescription ? (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {t("detailAbout")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {service.description}
            </p>
          </section>
        ) : null}

        {service.idealFor ? (
          <section className="mt-10 rounded-xl border border-border bg-surface-elevated/40 p-5 sm:p-6">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
              {t("idealFor")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85 sm:text-base">
              {service.idealFor}
            </p>
          </section>
        ) : null}

        {service.includedFeatures.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {t("included")}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {service.includedFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground sm:text-[0.95rem]"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {price.mode === "starting_at" || price.mode === "fixed" ? (
          <section className="mt-10 rounded-xl border border-border-gold/40 bg-surface/60 p-5 sm:p-6">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
              {t("detailPricing")}
            </h2>
            <p className="mt-2 font-mono text-base tracking-wide text-foreground sm:text-lg">
              {price.label}
            </p>
            {price.mode === "starting_at" ? (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {t("pricing.disclaimer")}
              </p>
            ) : null}
          </section>
        ) : null}

        {linkedProjects.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {t("relatedProjects")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("relatedProjectsSubtitle")}
            </p>
            <ul className="mt-5 grid grid-cols-1 gap-4">
              {linkedProjects.map((project) => (
                <li key={project.id}>
                  <ServiceLinkedProjectCard project={project} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <FaqSection faqs={faqs} compact headingId="offre-faq-heading" />

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {service.showCtaStart ? (
            <Button asChild size="lg" className="min-h-12">
              <ContactOpenLink
                serviceSlug={service.slug}
                serviceId={service.id}
                serviceReference={service.reference}
                projectType={service.inquiryProjectType}
                intent="start"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                {startLabel}
              </ContactOpenLink>
            </Button>
          ) : null}
          {linkedProjects[0] ? (
            <Button asChild variant="outline" size="lg" className="min-h-12">
              <Link href={`${routes.projects}/${linkedProjects[0].slug}`}>
                {t("viewCaseStudy")}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg" className="min-h-12">
              <Link href={routes.services}>{t("backToCatalog")}</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
