import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
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
  saleDetailPath,
} from "@/lib/routes";
import { ServiceIcon } from "@/lib/services/icons";
import { resolveServicePriceDisplay } from "@/lib/services/pricing";
import {
  getSiteSaleOfferBySlug,
  getSiteSaleOffers,
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
  const offers = await getSiteSaleOffers("fr");
  return offers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const offer = await getSiteSaleOfferBySlug(locale as Locale, slug);
  if (!offer) {
    return { robots: { index: false, follow: false } };
  }

  const title = offer.seoTitle || `${offer.title} — ${brand.name}`;
  const description =
    offer.seoDescription || offer.shortDescription || brand.description;

  return createPageMetadata({
    title,
    description,
    path: saleDetailPath(offer.slug),
  });
}

/**
 * Détail d’un site à vendre — distinct des services :
 * image du site, prix, contenu inclus, ce que je peux adapter.
 */
export default async function AVendreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("sales");
  const tProjects = await getTranslations("projects");
  const offer = await getSiteSaleOfferBySlug(locale, slug);
  if (!offer) notFound();

  const price = resolveServicePriceDisplay({
    pricingMode: offer.pricingMode,
    startingPriceCents: offer.startingPriceCents,
    currency: offer.currency,
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

  if (offer.linkedProjectId) {
    const published = await listPublishedProjectRows();
    const row = published?.find((p) => p.id === offer.linkedProjectId);
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

  const adaptLabel = offer.ctaLabel.trim() || t("ctaStart");
  const faqs = await getSiteFaqsForService(locale, offer.id);
  const siteCover = linkedProject?.coverImage || offer.coverImage;

  return (
    <main
      id="main-content"
      className="relative min-h-dvh overflow-hidden bg-background"
    >
      <CelestialAtlas intensity="subtle" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Link
          href={routes.forSale}
          className="inline-flex min-h-10 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          {t("backToCatalog")}
        </Link>

        {siteCover ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-border-gold/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={siteCover}
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
                {offer.reference}
              </p>
              <span className="rounded-full border border-border-gold/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary/80">
                {t("offerKind.product")}
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {offer.title}
            </h1>
          </div>
          {!siteCover ? (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border text-primary sm:h-14 sm:w-14"
              aria-hidden
            >
              <ServiceIcon name={offer.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          ) : null}
        </header>

        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {offer.shortDescription}
        </p>

        {/* Prix mis en avant — cœur de la fiche vente */}
        <section className="mt-8 rounded-xl border border-border-gold/50 bg-surface-elevated/50 p-5 sm:p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
            {t("detailPricing")}
          </h2>
          <p className="mt-2 font-mono text-2xl tracking-wide text-primary sm:text-3xl">
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
          {linkedProject?.liveUrl ? (
            <a
              href={linkedProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-10 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary-hover"
            >
              {tProjects("visitSite")}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
        </section>

        <CelestialDivider className="mt-10" />

        {offer.description && offer.description !== offer.shortDescription ? (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {t("detailAbout")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {offer.description}
            </p>
          </section>
        ) : null}

        {offer.includedFeatures.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {t("included")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("includedHint")}
            </p>
            <ul className="mt-4 space-y-2.5">
              {offer.includedFeatures.map((feature) => (
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

        {offer.idealFor ? (
          <section className="mt-10 rounded-xl border border-border bg-surface-elevated/40 p-5 sm:p-6">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
              {t("idealFor")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85 sm:text-base">
              {offer.idealFor}
            </p>
          </section>
        ) : null}

        {/* Ce que je peux encore offrir (adaptations) — distinct du service sur-mesure */}
        <section className="mt-10 rounded-xl border border-border-gold/40 bg-surface/60 p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {t("whatICanOfferTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("whatICanOfferBody")}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {offer.showCtaBuy ? (
              <Button asChild size="lg" className="min-h-12">
                <ContactOpenLink
                  serviceSlug={offer.slug}
                  serviceId={offer.id}
                  serviceReference={offer.reference}
                  projectType={offer.inquiryProjectType}
                  intent="buy"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                  {t("ctaBuy")}
                </ContactOpenLink>
              </Button>
            ) : null}
            <Button
              asChild
              size="lg"
              variant={offer.showCtaBuy ? "outline" : "default"}
              className="min-h-12"
            >
              <ContactOpenLink
                serviceSlug={offer.slug}
                serviceId={offer.id}
                serviceReference={offer.reference}
                projectType={offer.inquiryProjectType}
                intent="start"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                {adaptLabel}
              </ContactOpenLink>
            </Button>
          </div>
        </section>

        <FaqSection faqs={faqs} compact headingId="vente-faq-heading" />

        <div className="mt-12">
          <Button asChild variant="outline" size="lg" className="min-h-12">
            <Link href={routes.forSale}>{t("backToCatalog")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
