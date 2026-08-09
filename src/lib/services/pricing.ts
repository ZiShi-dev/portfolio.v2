import type { Locale } from "@/i18n/routing";
import type {
  ServiceCurrency,
  ServiceLocale,
  ServicePricingMode,
  ServiceStatus,
} from "@/lib/services/schema";

/**
 * Affiche un montant stocké en unités mineures selon la locale.
 * La donnée financière reste identique (integer cents).
 */
export function formatServicePrice(
  cents: number,
  currency: ServiceCurrency | string,
  locale: Locale | ServiceLocale | string
): string {
  const amount = cents / 100;
  const localeTag =
    locale === "fr" ? "fr-FR" : locale === "ar" ? "ar" : "en-US";
  try {
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export type ServicePriceDisplay =
  | { mode: "starting_at"; label: string; formattedAmount: string }
  | { mode: "quote_only"; label: string }
  | { mode: "contact"; label: string };

type PriceLabels = {
  /** next-intl : t("pricing.startingAt", { price }) */
  startingAt: (formattedPrice: string) => string;
  quoteOnly: string;
  contact: string;
};

export function resolveServicePriceDisplay(input: {
  pricingMode: ServicePricingMode;
  startingPriceCents: number | null;
  currency: string;
  locale: string;
  labels: PriceLabels;
}): ServicePriceDisplay {
  if (
    input.pricingMode === "starting_at" &&
    input.startingPriceCents !== null &&
    input.startingPriceCents >= 0
  ) {
    const formattedAmount = formatServicePrice(
      input.startingPriceCents,
      input.currency,
      input.locale
    );
    return {
      mode: "starting_at",
      formattedAmount,
      label: input.labels.startingAt(formattedAmount),
    };
  }
  if (input.pricingMode === "contact") {
    return { mode: "contact", label: input.labels.contact };
  }
  return { mode: "quote_only", label: input.labels.quoteOnly };
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

export function centsToEurosInput(cents: number | null): string {
  if (cents === null || cents === undefined) return "";
  const euros = cents / 100;
  return Number.isInteger(euros) ? String(euros) : euros.toFixed(2);
}

export function parseEurosToCents(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function isPublishedStatus(status: ServiceStatus): boolean {
  return status === "published";
}
