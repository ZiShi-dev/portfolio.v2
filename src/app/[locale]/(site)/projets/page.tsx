import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { JsonLd } from "@/components/json-ld";
import { brand } from "@/lib/brand";
import {
  createPageMetadata,
  localizedAbsoluteUrl,
  routes,
} from "@/lib/routes";
import { getSiteProjects } from "@/lib/projects/site";
import { buildListingJsonLd } from "@/lib/seo/listing-jsonld";
import type { Locale } from "@/i18n/routing";

const ProjectsPage = dynamic(
  () => import("@/components/sections/projects-page").then((m) => m.ProjectsPage)
);

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });

  return createPageMetadata({
    title: t("page.metaTitle", { brand: brand.name }),
    description: t("page.metaDescription", { brand: brand.name }),
    path: routes.projects,
    locale: locale as Locale,
  });
}

export default async function ProjetsRoute() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("projects");
  const projects = await getSiteProjects(locale);
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const listingUrl = localizedAbsoluteUrl(routes.projects, locale);

  return (
    <>
      <JsonLd
        nonce={nonce}
        data={buildListingJsonLd({
          name: t("page.title"),
          url: listingUrl,
          items: projects.map((project) => ({
            name: project.title,
            url: localizedAbsoluteUrl(
              `${routes.projects}/${project.slug ?? project.id}`,
              locale
            ),
          })),
        })}
      />
      <ProjectsPage projects={projects} />
    </>
  );
}
