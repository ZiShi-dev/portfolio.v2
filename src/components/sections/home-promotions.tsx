"use client";

import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { serviceDetailPath } from "@/lib/routes";
import { formatServicePrice, getServicePromotion } from "@/lib/services/pricing";
import type { LocalizedService } from "@/lib/services/store";

export function HomePromotions({ services }: { services: LocalizedService[] }) {
  const t = useTranslations("services");
  const locale = useLocale();
  const offers = services.flatMap((service) => {
    const promotion = getServicePromotion(service);
    return promotion ? [{ service, promotion }] : [];
  });
  if (!offers.length) return null;

  return (
    <section aria-label={t("promotion")} className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
        {offers.map(({ service, promotion }) => (
          <article
            key={service.id}
            className="card-feedback rounded-2xl border border-border-gold/40 bg-surface-elevated p-6 hover:border-border-gold"
          >
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              {t("promotion")}{" "}
              <span className="rounded-full border border-primary/30 px-2 py-1">−{promotion.discount}%</span>
            </p>
            <h2 className="mt-3 font-display text-2xl">{service.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{service.shortDescription}</p>
            <p className="mt-4 flex flex-wrap items-baseline gap-3">
              <del className="text-muted-foreground">{formatServicePrice(promotion.regular, service.currency, locale)}</del>
              <span className="text-xl font-semibold text-primary">
                {service.pricingMode === "starting_at"
                  ? t("pricing.startingAt", { price: formatServicePrice(promotion.reduced, service.currency, locale) })
                  : formatServicePrice(promotion.reduced, service.currency, locale)}
              </span>
            </p>
            <Link
              href={serviceDetailPath(service.slug)}
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t("promotionView")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
