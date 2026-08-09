import type { Locale } from "@/i18n/routing";
import {
  getPublishedServiceBySlug,
  getServiceByIdForAdmin,
  listPublishedServiceRows,
  serviceRowToLocalized,
  type LocalizedService,
  type ServiceRow,
} from "@/lib/services/store";

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
  return { service: serviceRowToLocalized(row, locale), row };
}
