import type { MetadataRoute } from "next";
import { absoluteUrl, routes, serviceDetailPath } from "@/lib/routes";
import { listPublishedProjectSlugs } from "@/lib/projects/store";
import { listPublishedServiceSlugs } from "@/lib/services/store";

/** Pages indexables — pas d’admin, pas de laisser-un-avis, pas de redirects vides. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
    lastModified?: Date;
  }> = [
    { path: routes.home, changeFrequency: "monthly", priority: 1 },
    { path: routes.services, changeFrequency: "weekly", priority: 0.85 },
    { path: routes.projects, changeFrequency: "weekly", priority: 0.85 },
    { path: routes.reviews, changeFrequency: "weekly", priority: 0.7 },
    { path: routes.contact, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.startProject, changeFrequency: "monthly", priority: 0.75 },
    { path: routes.legal, changeFrequency: "yearly", priority: 0.3 },
  ];

  const caseStudies = await listPublishedProjectSlugs();
  for (const cs of caseStudies) {
    pages.push({
      path: `${routes.projects}/${cs.slug}`,
      changeFrequency: "monthly",
      priority: 0.75,
      lastModified: new Date(cs.updated_at),
    });
  }

  const services = await listPublishedServiceSlugs();
  for (const svc of services) {
    pages.push({
      path: serviceDetailPath(svc.slug),
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: new Date(svc.updated_at),
    });
  }

  return pages.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: absoluteUrl(path),
    lastModified: lastModified ?? now,
    changeFrequency,
    priority,
  }));
}
