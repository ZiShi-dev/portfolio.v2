import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageBackBar } from "@/components/page-back-link";
import { Services } from "@/components/sections/services";
import { brand } from "@/lib/brand";
import { createPageMetadata, routes } from "@/lib/routes";
import { getSiteServices } from "@/lib/services/site";
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
  });
}

/** Catalogue public — ما نقدّمه لكم / Ce que nous créons pour vous */
export default async function OffresCatalogPage() {
  const locale = (await getLocale()) as Locale;
  const tCommon = await getTranslations("common");
  const services = await getSiteServices(locale);

  return (
    <main id="main-content">
      <PageBackBar href={routes.home} label={tCommon("backHome")} />
      <Services services={services} variant="page" />
    </main>
  );
}
