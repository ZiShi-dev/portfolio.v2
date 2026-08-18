import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CaseStudyDetail } from "@/components/sections/case-study-detail";
import { ProjectSaleDetail } from "@/components/sections/project-sale-detail";
import { brand, getFooterSocials } from "@/lib/brand";
import {
  getSiteProjectBySlug,
  getSiteProjects,
} from "@/lib/projects/site";
import { listPublishedProjectSlugs } from "@/lib/projects/store";
import { getPublishedReviewsForProject } from "@/lib/reviews/store";
import {
  absoluteUrl,
  createPageMetadata,
  localizedAbsoluteUrl,
  routes,
} from "@/lib/routes";
import type { Locale } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { headers } from "next/headers";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const fromDb = await listPublishedProjectSlugs();
  if (fromDb.length > 0) {
    return fromDb.map((p) => ({ slug: p.slug }));
  }
  // Démo locale
  return [
    { slug: "nova" },
    { slug: "maison-belle" },
    { slug: "atelier-lumiere" },
    { slug: "fitpro" },
  ];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const project = await getSiteProjectBySlug(locale, slug);
  if (!project) {
    return { title: brand.name, robots: { index: false, follow: false } };
  }

  const title = project.seoTitle || `${project.title} — ${brand.name}`;
  const description =
    project.seoDescription || project.desc || brand.description;
  return createPageMetadata({
    title,
    description,
    path: `${routes.projects}/${project.slug ?? slug}`,
    locale,
    ...(project.images[0]
      ? { image: { src: project.images[0].src, alt: project.title } }
      : {}),
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const project = await getSiteProjectBySlug(locale, slug);
  if (!project) notFound();

  const all = await getSiteProjects(locale);
  const idx = all.findIndex(
    (p) => p.slug === project.slug || p.id === project.id
  );
  const next = idx >= 0 ? all[(idx + 1) % all.length] : null;
  const nextSlug =
    next && next.id !== project.id ? next.slug ?? next.id : null;

  const reviews = await getPublishedReviewsForProject(project.id);
  const t = await getTranslations("projects");
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const projectUrl = localizedAbsoluteUrl(
    `${routes.projects}/${project.slug ?? slug}`,
    locale
  );
  const projectEntity =
    project.categoryKey === "for_sale" && project.listingPriceCents != null
      ? {
          "@type": "Product",
          "@id": `${projectUrl}#product`,
          name: project.title,
          description: project.seoDescription || project.desc,
          url: projectUrl,
          inLanguage: locale,
          ...(project.images.length > 0
            ? { image: project.images.map((image) => absoluteUrl(image.src)) }
            : {}),
          ...(project.listingPriceCents != null
            ? {
                offers: {
                  "@type": "Offer",
                  priceCurrency: "EUR",
                  price: (project.listingPriceCents / 100).toFixed(2),
                  url: projectUrl,
                  availability: "https://schema.org/InStock",
                },
              }
            : {}),
        }
      : {
          "@type": "CreativeWork",
          "@id": `${projectUrl}#project`,
          name: project.title,
          description: project.seoDescription || project.desc,
          url: projectUrl,
          inLanguage: locale,
          creator: { "@id": `${absoluteUrl(routes.home)}#organization` },
          ...(project.images.length > 0
            ? { image: project.images.map((image) => absoluteUrl(image.src)) }
            : {}),
        };
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t("eyebrow"),
            item: localizedAbsoluteUrl(routes.projects, locale),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: project.title,
            item: projectUrl,
          },
        ],
      },
      projectEntity,
    ],
  };

  if (project.categoryKey === "for_sale") {
    const socials = await getFooterSocials();
    return (
      <>
        <JsonLd data={projectJsonLd} nonce={nonce} />
        <ProjectSaleDetail
          project={project}
          nextSlug={nextSlug}
          reviews={reviews}
          contacts={{ socials }}
        />
      </>
    );
  }

  return (
    <>
      <JsonLd data={projectJsonLd} nonce={nonce} />
      <CaseStudyDetail
        project={project}
        nextSlug={nextSlug}
        reviews={reviews}
      />
    </>
  );
}
