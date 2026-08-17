import type { Locale } from "@/i18n/routing";
import {
  listPublishedProjectRows,
  projectCoverUrl,
  projectRowToLocalized,
  type ProjectRow,
} from "@/lib/projects/store";
import {
  getPublishedServiceBySlug,
  getServiceByIdForAdmin,
  listPublishedServiceRows,
  serviceRowToLocalized,
  type LocalizedService,
  type ServiceRow,
} from "@/lib/services/store";

/** Aperçu projet lié à une offre (détail uniquement). */
export type ServiceRelatedProject = {
  id: string;
  slug: string;
  title: string;
  reference?: string;
  /** URL externe du projet live, si renseignée. */
  externalUrl?: string;
  /** Quelques images du projet (URLs du projet lui-même). */
  images: string[];
};

const MAX_RELATED_IMAGES = 4;

function projectPreviewImages(row: ProjectRow): string[] {
  const urls: string[] = [];
  const cover = projectCoverUrl(row);
  if (cover) urls.push(cover);
  for (const img of row.images) {
    if (!img.url || urls.includes(img.url)) continue;
    urls.push(img.url);
    if (urls.length >= MAX_RELATED_IMAGES) break;
  }
  return urls.slice(0, MAX_RELATED_IMAGES);
}

/**
 * Offres publiées pour le catalogue / l’accueil.
 * Pas d’images projets : le catalogue n’affiche que les services proposés.
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

/**
 * Projets liés à une offre — pour la page détail uniquement
 * (liens + quelques images issues du projet).
 */
export async function getServiceRelatedProjects(
  locale: Locale,
  service: Pick<LocalizedService, "linkedProjectId" | "caseStudyIds">
): Promise<ServiceRelatedProject[]> {
  const ids = [
    ...new Set(
      [service.linkedProjectId, ...service.caseStudyIds].filter(
        (id): id is string => Boolean(id)
      )
    ),
  ];
  if (ids.length === 0) return [];

  const published = await listPublishedProjectRows();
  if (!published) return [];

  const byId = new Map(published.map((p) => [p.id, p]));
  const related: ServiceRelatedProject[] = [];

  for (const id of ids) {
    const row = byId.get(id);
    if (!row) continue;
    const localized = projectRowToLocalized(row, locale, row.kind);
    related.push({
      id,
      slug: localized.slug ?? row.slug,
      title: localized.title,
      reference: localized.reference,
      externalUrl: row.link ?? undefined,
      images: projectPreviewImages(row),
    });
  }

  return related;
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
