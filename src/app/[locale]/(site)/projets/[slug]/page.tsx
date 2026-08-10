import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { CaseStudyDetail } from "@/components/sections/case-study-detail";
import { brand } from "@/lib/brand";
import {
  getSiteProjectBySlug,
  getSiteProjects,
} from "@/lib/projects/site";
import { listPublishedProjectSlugs } from "@/lib/projects/store";
import { getPublishedReviewsForProject } from "@/lib/reviews/store";
import { absoluteUrl, routes } from "@/lib/routes";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

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
    return { title: brand.name };
  }

  const title = project.seoTitle || `${project.title} — ${brand.name}`;
  const description =
    project.seoDescription || project.desc || brand.description;
  const path = `${routes.projects}/${project.slug ?? slug}`;
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: brand.name,
      images: project.images[0]
        ? [{ url: project.images[0].src, alt: project.title }]
        : undefined,
    },
  };
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

  return (
    <CaseStudyDetail
      project={project}
      nextSlug={nextSlug}
      reviews={reviews}
    />
  );
}
