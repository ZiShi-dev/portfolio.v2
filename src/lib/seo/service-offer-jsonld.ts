import type { ServicePriceDisplay } from "@/lib/services/pricing";

export function buildServiceOfferJsonLd({ mode, cents, currency, url }: {
  mode: ServicePriceDisplay["mode"];
  cents: number | null;
  currency: string;
  url: string;
}) {
  if (mode === "contact" || cents === null) return undefined;

  const amount = cents / 100;
  return {
    "@type": "Offer",
    url,
    ...(mode === "fixed"
      ? { price: amount, priceCurrency: currency }
      : {
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: amount,
            priceCurrency: currency,
          },
        }),
  };
}
