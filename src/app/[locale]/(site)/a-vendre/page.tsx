import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SaleOffers } from "@/components/sections/sale-offers";
import { brand } from "@/lib/brand";
import { createPageMetadata, routes } from "@/lib/routes";
import { getSiteSaleOffers } from "@/lib/services/site";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sales" });

  return createPageMetadata({
    title: t("page.metaTitle", { brand: brand.name }),
    description: t("page.metaDescription", { brand: brand.name }),
    path: routes.forSale,
  });
}

/** Catalogue public — offres à vendre */
export default async function AVendreCatalogPage() {
  const locale = (await getLocale()) as Locale;
  const offers = await getSiteSaleOffers(locale);

  return (
    <main id="main-content">
      <SaleOffers offers={offers} variant="page" />
    </main>
  );
}
