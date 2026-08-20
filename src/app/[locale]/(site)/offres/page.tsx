import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { PageBackBar } from "@/components/page-back-link";
import { Services } from "@/components/sections/services";
import { JsonLd } from "@/components/json-ld";
import { brand } from "@/lib/brand";
import {
  createPageMetadata,
  localizedAbsoluteUrl,
  routes,
  serviceDetailPath,
} from "@/lib/routes";
import { getSiteServices } from "@/lib/services/site";
import { buildListingJsonLd } from "@/lib/seo/listing-jsonld";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });

  return createPageMetadata({
    title: t("page.metaTitle", { brand: brand.name }),
    description: t("page.metaDescription", { brand: brand.name }),
    path: routes.services,
    locale: locale as Locale,
  });
}

/** Catalogue public — ما نقدّمه لكم / Ce que nous créons pour vous */
export default async function OffresCatalogPage() {
  const locale = (await getLocale()) as Locale;
  const tCommon = await getTranslations("common");
  const t = await getTranslations("services");
  const services = await getSiteServices(locale);
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const listingUrl = localizedAbsoluteUrl(routes.services, locale);

  return (
    <>
      <JsonLd
        nonce={nonce}
        data={buildListingJsonLd({
          name: t("catalogTitle"),
          url: listingUrl,
          items: services.map((service) => ({
            name: service.title,
            url: localizedAbsoluteUrl(serviceDetailPath(service.slug), locale),
          })),
        })}
      />
      <PageBackBar href={routes.home} label={tCommon("backHome")} />
      <Services services={services} variant="page" />
    </>
  );
}
