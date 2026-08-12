import type { Locale } from "@/i18n/routing";
import {
  listPublishedProjectRows,
  projectCoverUrl,
} from "@/lib/projects/store";
import type { ServiceOfferKind } from "@/lib/services/schema";
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

async function getSiteOffersByKind(
  locale: Locale,
  kind: ServiceOfferKind
): Promise<LocalizedService[]> {
  const rows = await listPublishedServiceRows();
  if (!rows || rows.length === 0) return [];
  const catalogRows = rows.filter((row) => row.offer_kind === kind);
  if (catalogRows.length === 0) return [];
  const covers = await linkedProjectCoverById(
    catalogRows.map((r) => r.linked_project_id)
  );
  return catalogRows.map((row) => localizeWithLinkedCover(row, locale, covers));
}

async function getSiteOfferBySlugAndKind(
  locale: Locale,
  slug: string,
  kind: ServiceOfferKind
): Promise<LocalizedService | null> {
  const row = await getPublishedServiceBySlug(slug);
  if (!row || row.offer_kind !== kind) return null;
  const covers = await linkedProjectCoverById([row.linked_project_id]);
  return localizeWithLinkedCover(row, locale, covers);
}

/**
 * Services publiés (/offres). Image via projet lié uniquement.
 */
export async function getSiteServices(
  locale: Locale
): Promise<LocalizedService[]> {
  return getSiteOffersByKind(locale, "service");
}

export async function getSiteServiceBySlug(
  locale: Locale,
  slug: string
): Promise<LocalizedService | null> {
  return getSiteOfferBySlugAndKind(locale, slug, "service");
}

/**
 * Offres à vendre publiées (/a-vendre). Image via projet lié uniquement.
 */
export async function getSiteSaleOffers(
  locale: Locale
): Promise<LocalizedService[]> {
  return getSiteOffersByKind(locale, "product");
}

export async function getSiteSaleOfferBySlug(
  locale: Locale,
  slug: string
): Promise<LocalizedService | null> {
  return getSiteOfferBySlugAndKind(locale, slug, "product");
}

/** Preview admin uniquement (drafts inclus, tout kind). */
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
