"use client";

import { ArrowUpRight, MessageSquare } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ContactOpenLink } from "@/components/contact-open-link";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/glow-card";
import { Link } from "@/i18n/navigation";
import { ServiceIcon } from "@/lib/services/icons";
import { resolveServicePriceDisplay } from "@/lib/services/pricing";
import { serviceDetailPath } from "@/lib/routes";
import type { LocalizedService } from "@/lib/services/store";
import { cn } from "@/lib/utils";

type ServiceOfferCardProps = {
  service: LocalizedService;
};

/**
 * Carte catalogue compacte : description tronquée (3 lignes).
 * Image éventuelle via projet lié.
 */
export function ServiceOfferCard({ service }: ServiceOfferCardProps) {
  const t = useTranslations("services");
  const locale = useLocale();

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

  const startLabel = service.ctaLabel.trim() || t("ctaStart");
  const detailHref = serviceDetailPath(service.slug);
  const showStart = service.showCtaStart;
  const showCover = Boolean(service.coverImage);

  return (
    <GlowCard className="h-full overflow-hidden p-0">
      <article className="flex h-full flex-col">
        {showCover ? (
          <Link
            href={detailHref}
            className="relative block aspect-[16/10] overflow-hidden border-b border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.coverImage!}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          </Link>
        ) : null}

        <div className={cn("flex flex-1 flex-col p-5 sm:p-6", showCover && "pt-4")}>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/70">
              {service.reference}
            </span>
            {!showCover ? (
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-primary"
                aria-hidden
              >
                <ServiceIcon name={service.icon} className="h-4 w-4" />
              </div>
            ) : null}
          </div>

          <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-foreground sm:text-xl">
            <Link
              href={detailHref}
              className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {service.title}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {service.shortDescription}
          </p>

          <p
            className={cn(
              "mt-4 font-mono tracking-wide text-foreground/80",
              price.mode === "fixed"
                ? "text-sm font-medium text-primary sm:text-base"
                : "text-[11px]"
            )}
          >
            {price.label}
          </p>

          <div className="mt-auto flex flex-col gap-2 pt-5">
            {showStart ? (
              <Button asChild size="default" className="min-h-11 w-full">
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
              className="inline-flex min-h-10 items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80 transition-colors hover:text-primary"
            >
              {t("learnMore")}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    </GlowCard>
  );
}
