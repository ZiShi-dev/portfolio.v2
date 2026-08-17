import type { Locale } from "@/i18n/routing";
import {
  listPublishedProjectRows,
  projectCoverUrl,
  projectRowToLocalized,
} from "@/lib/projects/store";
import {
  getPublishedServiceBySlug,
  getServiceByIdForAdmin,
  listPublishedServiceRows,
  serviceRowToLocalized,
  type LocalizedService,
  type ServiceRow,
} from "@/lib/services/store";

export type LinkedOfferProject = {
  id: string;
  slug: string;
  title: string;
  reference?: string;
  description: string;
  image: string | null;
};

/**
 * Offres publiées pour le site. Tableau vide si BDD absente / vide
 * (pas de hardcode frontend — le seed SQL porte le contenu initial).
 */
export async function getSiteServices(
  locale: Locale
): Promise<LocalizedService[]> {
  const rows = await listPublishedServiceRows();
  if (!rows || rows.length === 0) return [];
  return rows.map((row) => serviceRowToLocalized(row, locale));
}

export async function getSiteServiceBySlug(
  locale: Locale,
  slug: string
): Promise<LocalizedService | null> {
  const row = await getPublishedServiceBySlug(slug);
  if (!row) return null;
  return serviceRowToLocalized(row, locale);
}

/** Preview admin uniquement (drafts inclus). */
export async function getAdminPreviewService(
  locale: Locale,
  id: string
): Promise<{ service: LocalizedService; row: ServiceRow } | null> {
  const row = await getServiceByIdForAdmin(id);
  if (!row) return null;
  return {
    service: serviceRowToLocalized(row, locale),
    row,
  };
}

/** Projets liés à une offre, avec image et description pour /offres/[slug]. */
export async function getLinkedProjectsForService(
  service: LocalizedService,
  locale: Locale
): Promise<LinkedOfferProject[]> {
  const orderedIds = service.caseStudies.map((item) => item.projectId);
  if (service.linkedProjectId && !orderedIds.includes(service.linkedProjectId)) {
    orderedIds.unshift(service.linkedProjectId);
  }
  if (orderedIds.length === 0) return [];

  const published = await listPublishedProjectRows();
  if (!published) return [];

  const byId = new Map(published.map((row) => [row.id, row]));
  const blurbById = new Map(
    service.caseStudies.map((item) => [item.projectId, item.blurb])
  );

  const result: LinkedOfferProject[] = [];
  for (const id of orderedIds) {
    const row = byId.get(id);
    if (!row) continue;
    const localized = projectRowToLocalized(row, locale, row.kind);
    const blurb = (blurbById.get(id) ?? "").trim();
    result.push({
      id: row.id,
      slug: localized.slug ?? row.slug,
      title: localized.title,
      reference: localized.reference,
      description: blurb || localized.desc,
      image: projectCoverUrl(row) ?? localized.images[0]?.src ?? null,
    });
  }
  return result;
}
