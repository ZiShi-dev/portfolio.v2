import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  localizedAbsoluteUrl,
  localizedAlternates,
  routes,
  serviceDetailPath,
} from "@/lib/routes";
import {
  listPublishedProjectRows,
  projectCoverUrl,
} from "@/lib/projects/store";
import { listPublishedServiceSlugs } from "@/lib/services/store";
import { projectCatalog } from "@/data/projects";
import { locales } from "@/i18n/routing";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";
import {
  parseSitemapDate,
  uniqueAbsoluteHttpUrls,
} from "@/lib/seo/sitemap-utils";

/** Pages indexables — pas d’admin, pas de laisser-un-avis, pas d’API. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
    lastModified?: Date;
    images?: string[];
  }> = [
    { path: routes.home, changeFrequency: "monthly", priority: 1 },
    { path: routes.services, changeFrequency: "weekly", priority: 0.85 },
    { path: routes.projects, changeFrequency: "weekly", priority: 0.85 },
    { path: routes.reviews, changeFrequency: "weekly", priority: 0.7 },
    { path: routes.contact, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.startProject, changeFrequency: "monthly", priority: 0.75 },
    { path: routes.legal, changeFrequency: "yearly", priority: 0.3 },
  ];

  let projectRows: Awaited<ReturnType<typeof listPublishedProjectRows>> = null;
  let services: { slug: string; updated_at: string }[] = [];

  try {
    [projectRows, services] = await Promise.all([
      listPublishedProjectRows(),
      listPublishedServiceSlugs(),
    ]);
  } catch (err) {
    console.error("[sitemap] fetch failed", err);
  }

  const projectEntries =
    projectRows && projectRows.length > 0
      ? projectRows.map((project) => ({
          slug: project.slug,
          updated_at: project.updated_at,
          images: [
            projectCoverUrl(project),
            ...project.images.map((image) => image.url),
          ],
        }))
      : isSupabaseServiceConfigured()
        ? []
        : projectCatalog.map((project) => ({
            slug: project.id,
            updated_at: null as string | null,
            images: project.images.map((image) => image.src),
          }));

  for (const cs of projectEntries) {
    if (!cs.slug) continue;
    const lastModified = parseSitemapDate(cs.updated_at);
    const images = uniqueAbsoluteHttpUrls(cs.images, absoluteUrl);
    pages.push({
      path: `${routes.projects}/${cs.slug}`,
      changeFrequency: "monthly",
      priority: 0.75,
      ...(lastModified ? { lastModified } : {}),
      ...(images.length > 0 ? { images } : {}),
    });
  }

  for (const svc of services) {
    if (!svc.slug) continue;
    const lastModified = parseSitemapDate(svc.updated_at);
    pages.push({
      path: serviceDetailPath(svc.slug),
      changeFrequency: "monthly",
      priority: 0.7,
      ...(lastModified ? { lastModified } : {}),
    });
  }

  return pages.flatMap(
    ({ path, changeFrequency, priority, lastModified, images }) =>
      locales.map((locale) => ({
        url: localizedAbsoluteUrl(path, locale),
        alternates: { languages: localizedAlternates(path) },
        ...(lastModified ? { lastModified } : {}),
        changeFrequency,
        priority,
        ...(images && images.length > 0 ? { images } : {}),
      }))
  );
}
