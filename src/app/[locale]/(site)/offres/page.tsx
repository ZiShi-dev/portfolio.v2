import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Services } from "@/components/sections/services";
import { brand } from "@/lib/brand";
import { createPageMetadata, routes } from "@/lib/routes";
import { getSiteProjects } from "@/lib/projects/site";
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

/** Catalogue public — عروضنا التجارية / Nos offres commerciales */
export default async function OffresCatalogPage() {
  const locale = (await getLocale()) as Locale;
  const [services, projects] = await Promise.all([
    getSiteServices(locale),
    getSiteProjects(locale),
  ]);

  return (
    <main id="main-content">
      <Services services={services} projects={projects} variant="page" />
    </main>
  );
}
