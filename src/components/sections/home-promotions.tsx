"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { serviceDetailPath } from "@/lib/routes";
import { formatServicePrice, getServicePromotion } from "@/lib/services/pricing";
import type { LocalizedService } from "@/lib/services/store";

export function HomePromotions({ services }: { services: LocalizedService[] }) {
  const t = useTranslations("services");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const offers = services.flatMap((service) => {
    const promotion = getServicePromotion(service);
    return promotion ? [{ service, promotion }] : [];
  });
  if (!offers.length) return null;

  return (
    <section aria-label={t("promotion")} className="relative overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
        {offers.map(({ service, promotion }, index) => (
          <motion.div key={service.id} initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: reduceMotion ? 0 : Math.min(index, 5) * 0.08 }} className="relative overflow-hidden rounded-2xl border border-primary/30 bg-surface-elevated p-6">
            <motion.div aria-hidden className="pointer-events-none absolute -inset-20 bg-gradient-to-r from-transparent via-primary/10 to-transparent" animate={reduceMotion ? undefined : { x: ["-100%", "100%"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} />
            <div className="relative">
              <p className="flex items-center gap-2 text-sm font-medium text-primary"><Sparkles className="h-4 w-4" aria-hidden />{t("promotion")} <span className="rounded-full border border-primary/30 px-2 py-1">−{promotion.discount}%</span></p>
              <h2 className="mt-3 font-display text-2xl">{service.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{service.shortDescription}</p>
              <p className="mt-4 flex flex-wrap items-baseline gap-3"><del className="text-muted-foreground">{formatServicePrice(promotion.regular, service.currency, locale)}</del><span className="text-xl font-semibold text-primary">{service.pricingMode === "starting_at" ? t("pricing.startingAt", { price: formatServicePrice(promotion.reduced, service.currency, locale) }) : formatServicePrice(promotion.reduced, service.currency, locale)}</span></p>
              <Link href={serviceDetailPath(service.slug)} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{t("promotionView")}<ArrowUpRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
