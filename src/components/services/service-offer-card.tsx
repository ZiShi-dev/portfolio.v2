"use client";

import { MessageSquare } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ContactOpenLink } from "@/components/contact-open-link";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/glow-card";
import { Link } from "@/i18n/navigation";
import { ServiceIcon } from "@/lib/services/icons";
import { resolveServicePriceDisplay, getServicePromotion, formatServicePrice } from "@/lib/services/pricing";
import { serviceDetailPath } from "@/lib/routes";
import type { LocalizedService } from "@/lib/services/store";
import { cn } from "@/lib/utils";

type ServiceOfferCardProps = {
  service: LocalizedService;
  /** Accueil : fiche plus courte, sans CTA principal. */
  compact?: boolean;
};

/** Carte catalogue compacte : icône, texte, CTA. Sans image projet. */
export function ServiceOfferCard({
  service,
  compact = false,
}: ServiceOfferCardProps) {
  const t = useTranslations("services");
  const locale = useLocale();
  const promotion = getServicePromotion(service);

  const price = resolveServicePriceDisplay({
    pricingMode: service.pricingMode,
    startingPriceCents: service.startingPriceCents,
    promotionPriceCents: service.promotionPriceCents,
    currency: service.currency,
    locale,
    labels: {
      startingAt: (amount) => t("pricing.startingAt", { price: amount }),
      fixed: (amount) => t("pricing.fixed", { price: amount }),
      contact: t("pricing.contact"),
    },
  });

  const startLabel = service.ctaLabel.trim() || t("ctaStart");
  const detailHref = serviceDetailPath(service.slug);
  const showStart = service.showCtaStart && !compact;
  const Heading = compact ? "h3" : "h2";

  return (
    <GlowCard className="h-full overflow-hidden p-0">
      <article
        className={cn("flex h-full flex-col", compact ? "p-5" : "p-5 sm:p-6")}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs tracking-[0.12em] text-primary/80">
            {service.reference}
          </span>
          <ServiceIcon name={service.icon} className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
        </div>

        <Heading className="mt-4 font-display text-lg font-semibold leading-snug text-foreground sm:text-xl">
          <Link
            href={detailHref}
            className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {service.title}
          </Link>
        </Heading>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {service.shortDescription}
        </p>

        {(price.mode === "starting_at" || price.mode === "fixed") ? (
          <p className="mt-4 font-mono text-[11px] tracking-wide text-foreground/80">
            {promotion ? <><span className="me-2 rounded-full bg-primary/10 px-2 py-1 text-primary">{t("promotion")} −{promotion.discount}%</span><del className="me-2 text-muted-foreground">{formatServicePrice(promotion.regular, service.currency, locale)}</del></> : null}
            {price.label}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-5">
          {showStart ? (
            <Button
              asChild
              variant="outline"
              size="default"
              className="min-h-11 w-full border-border-gold hover:border-primary hover:bg-primary/10"
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
          <Link
            href={detailHref}
            className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("learnMore")}
          </Link>
        </div>
      </article>
    </GlowCard>
  );
}
