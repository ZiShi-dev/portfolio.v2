import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight, Check, ExternalLink, MessageSquare } from "lucide-react";
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
  getSiteServiceBySlug,
  getSiteServices,
} from "@/lib/services/site";
import { getSiteFaqsForService } from "@/lib/faqs/site";
import { FaqSection } from "@/components/sections/faq";
import { isSafeHttpUrl } from "@/lib/review-schema";
import {
  listPublishedProjectRows,
  projectCoverUrl,
  projectRowToLocalized,
} from "@/lib/projects/store";

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

/** Page détail d’une offre — lien projet réalisé + image du projet */
export default async function OffreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("services");
  const tProjects = await getTranslations("projects");
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
      quoteOnly: t("pricing.quoteOnly"),
      contact: t("pricing.contact"),
    },
  });

  let linkedProject: {
    slug: string;
    title: string;
    reference?: string;
    coverImage: string | null;
    liveUrl: string | null;
  } | null = null;

  if (service.linkedProjectId) {
    const published = await listPublishedProjectRows();
    const row = published?.find((p) => p.id === service.linkedProjectId);
    if (row) {
      const localized = projectRowToLocalized(row, locale, row.kind);
      const live =
        localized.link && isSafeHttpUrl(localized.link) ? localized.link : null;
      linkedProject = {
        slug: localized.slug ?? row.slug,
        title: localized.title,
        reference: localized.reference,
        coverImage: projectCoverUrl(row) ?? null,
        liveUrl: live,
      };
    }
  }

  const startLabel = service.ctaLabel.trim() || t("ctaStart");
  const faqs = await getSiteFaqsForService(locale, service.id);
  const projectCover = linkedProject?.coverImage || service.coverImage;

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

        {projectCover ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-border-gold/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={projectCover}
              alt=""
              className="aspect-[16/9] w-full object-cover"
              decoding="async"
            />
          </div>
        ) : null}

        <header className="mt-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/70">
              {service.reference}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {service.title}
            </h1>
            <p className="mt-4 font-mono text-lg tracking-wide text-primary sm:text-xl">
              {price.label}
            </p>
          </div>
          {!projectCover ? (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border text-primary sm:h-14 sm:w-14"
              aria-hidden
            >
              <ServiceIcon name={service.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          ) : null}
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
          {price.mode === "fixed" ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {t("pricing.fixedDisclaimer")}
            </p>
          ) : null}
        </section>

        {linkedProject ? (
          <section className="mt-10 overflow-hidden rounded-xl border border-border-gold/50 bg-surface-elevated/50">
            {linkedProject.coverImage &&
            linkedProject.coverImage !== projectCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={linkedProject.coverImage}
                alt=""
                className="aspect-[16/9] w-full object-cover"
                decoding="async"
              />
            ) : null}
            <div className="p-5 sm:p-6">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {t("linkedProjectEyebrow")}
              </h2>
              <p className="mt-2 font-display text-lg font-semibold text-foreground sm:text-xl">
                {linkedProject.title}
              </p>
              {linkedProject.reference ? (
                <p className="mt-1 font-mono text-[10px] tracking-wider text-muted-foreground">
                  {linkedProject.reference}
                </p>
              ) : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {linkedProject.liveUrl ? (
                  <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
                    <a
                      href={linkedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tProjects("seeSite")}
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
                    <Link href={`${routes.projects}/${linkedProject.slug}`}>
                      {t("viewProjectLink")}
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
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
          <Button asChild variant="outline" size="lg" className="min-h-12">
            <Link href={routes.services}>{t("backToCatalog")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
