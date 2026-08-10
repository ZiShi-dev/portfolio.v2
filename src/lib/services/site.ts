import type { Locale } from "@/i18n/routing";
import {
  listPublishedProjectRows,
  projectCoverUrl,
} from "@/lib/projects/store";
import {
  getPublishedServiceBySlug,
  getServiceByIdForAdmin,
  listPublishedServiceRows,
  serviceRowToLocalized,
  type LocalizedService,
  type ServiceRow,
} from "@/lib/services/store";

/** Première image du projet lié → cover d’offre (sinon aucune image). */
async function linkedProjectCoverById(
  projectIds: Array<string | null | undefined>
): Promise<Map<string, string>> {
  const unique = [
    ...new Set(projectIds.filter((id): id is string => Boolean(id))),
  ];
  const map = new Map<string, string>();
  if (unique.length === 0) return map;

  const published = await listPublishedProjectRows();
  if (!published) return map;

  for (const row of published) {
    if (!unique.includes(row.id)) continue;
    const cover = projectCoverUrl(row);
    if (cover) map.set(row.id, cover);
  }
  return map;
}

function localizeWithLinkedCover(
  row: ServiceRow,
  locale: Locale,
  covers: Map<string, string>
): LocalizedService {
  const linkedCover = row.linked_project_id
    ? covers.get(row.linked_project_id) ?? null
    : null;
  return serviceRowToLocalized(row, locale, { coverImage: linkedCover });
}

/**
 * Offres publiées pour le site. Tableau vide si BDD absente / vide
 * (pas de hardcode frontend — le seed SQL porte le contenu initial).
 * Image : uniquement via projet lié (sinon null).
 */
export async function getSiteServices(
  locale: Locale
): Promise<LocalizedService[]> {
  const rows = await listPublishedServiceRows();
  if (!rows || rows.length === 0) return [];
  const covers = await linkedProjectCoverById(
    rows.map((r) => r.linked_project_id)
  );
  return rows.map((row) => localizeWithLinkedCover(row, locale, covers));
}

export async function getSiteServiceBySlug(
  locale: Locale,
  slug: string
): Promise<LocalizedService | null> {
  const row = await getPublishedServiceBySlug(slug);
  if (!row) return null;
  const covers = await linkedProjectCoverById([row.linked_project_id]);
  return localizeWithLinkedCover(row, locale, covers);
}

/** Preview admin uniquement (drafts inclus). */
export async function getAdminPreviewService(
  locale: Locale,
  id: string
): Promise<{ service: LocalizedService; row: ServiceRow } | null> {
  const row = await getServiceByIdForAdmin(id);
  if (!row) return null;
  const covers = await linkedProjectCoverById([row.linked_project_id]);
  return {
    service: localizeWithLinkedCover(row, locale, covers),
    row,
  };
}
