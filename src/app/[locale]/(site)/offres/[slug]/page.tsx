import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight, Check, MessageSquare, ShoppingBag } from "lucide-react";
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
import {
  listPublishedProjectRows,
  projectRowToLocalized,
} from "@/lib/projects/store";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function DetailCtaButton({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const external = /^https?:\/\//i.test(href);

  return (
    <Button asChild variant="outline" size="lg" className={className}>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {label}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      ) : (
        <Link href={href}>
          {label}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </Button>
  );
}

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
      quoteOnly: t("pricing.quoteOnly"),
      contact: t("pricing.contact"),
    },
  });

  const related: {
    slug: string;
    title: string;
    reference?: string;
    id: string;
  }[] = [];
  if (service.caseStudyIds.length > 0 || service.linkedProjectId) {
    const published = await listPublishedProjectRows();
    if (published) {
      const byId = new Map(published.map((p) => [p.id, p]));
      const pushRelated = (id: string) => {
        if (related.some((r) => r.id === id)) return;
        const row = byId.get(id);
        if (!row) return;
        const localized = projectRowToLocalized(row, locale, row.kind);
        related.push({
          id,
          slug: localized.slug ?? row.slug,
          title: localized.title,
          reference: localized.reference,
        });
      };
      if (service.linkedProjectId) pushRelated(service.linkedProjectId);
      for (const id of service.caseStudyIds) pushRelated(id);
    }
  }

  const linkedProject =
    related.find((p) => p.id === service.linkedProjectId) ?? null;
  const fallbackProject = linkedProject ?? related[0] ?? null;
  const startLabel = service.ctaLabel.trim() || t("ctaStart");
  const detailCta =
    service.detailCtaType === "custom" && service.detailCtaUrl
      ? {
          href: service.detailCtaUrl,
          label: service.detailCtaLabel.trim() || t("visitExternalLink"),
        }
      : service.detailCtaType === "projects"
        ? {
            href: routes.projects,
            label: service.detailCtaLabel.trim() || t("viewProjects"),
          }
        : fallbackProject
          ? {
              href: `${routes.projects}/${fallbackProject.slug}`,
              label:
                service.detailCtaLabel.trim() ||
                (linkedProject
                  ? t("viewLinkedProject")
                  : t("viewCaseStudy")),
            }
          : null;
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

        {service.coverImage ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-border-gold/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.coverImage}
              alt=""
              className="aspect-[16/9] w-full object-cover"
              decoding="async"
            />
          </div>
        ) : null}

        <header className="mt-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/70">
                {service.reference}
              </p>
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {t(`offerKind.${service.offerKind}`)}
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {service.title}
            </h1>
            <p className="mt-4 font-mono text-lg tracking-wide text-primary sm:text-xl">
              {price.label}
            </p>
          </div>
          {!service.coverImage ? (
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
          <section className="mt-10 rounded-xl border border-border-gold/50 bg-surface-elevated/50 p-5 sm:p-6">
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
            {service.detailCtaType === "linked_project" && detailCta ? (
              <DetailCtaButton
                href={detailCta.href}
                label={detailCta.label}
                className="mt-5 min-h-12 w-full sm:w-auto"
              />
            ) : null}
          </section>
        ) : null}

        {related.filter((p) => p.id !== linkedProject?.id).length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {t("relatedProjects")}
            </h2>
            <ul className="mt-4 space-y-2">
              {related
                .filter((p) => p.id !== linkedProject?.id)
                .map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`${routes.projects}/${p.slug}`}
                    className="group flex min-h-12 items-center justify-between gap-3 rounded-lg border border-border bg-surface-elevated/30 px-4 py-3 transition-colors hover:border-primary/40"
                  >
                    <span className="text-sm text-foreground group-hover:text-primary">
                      {p.title}
                    </span>
                    {p.reference ? (
                      <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                        {p.reference}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <FaqSection faqs={faqs} compact headingId="offre-faq-heading" />

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {service.showCtaBuy ? (
            <Button asChild size="lg" className="min-h-12">
              <ContactOpenLink
                serviceSlug={service.slug}
                serviceId={service.id}
                serviceReference={service.reference}
                projectType={service.inquiryProjectType}
                intent="buy"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                {t("ctaBuy")}
              </ContactOpenLink>
            </Button>
          ) : null}
          {service.showCtaStart ? (
            <Button
              asChild
              size="lg"
              variant={service.showCtaBuy ? "outline" : "default"}
              className="min-h-12"
            >
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
          {detailCta ? (
            <DetailCtaButton
              href={detailCta.href}
              label={detailCta.label}
              className="min-h-12"
            />
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
