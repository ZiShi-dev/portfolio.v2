import type { Locale } from "@/i18n/routing";
import {
  engagementRowToLocalized,
  listPublishedEngagementRows,
  type LocalizedEngagement,
} from "@/lib/engagements/store";

/** Engagements publiés pour le site (jamais de fallback hardcodé). */
export async function getSiteEngagements(
  locale: Locale
): Promise<LocalizedEngagement[]> {
  const rows = await listPublishedEngagementRows();
  if (!rows) return [];
  return rows.map((row) => engagementRowToLocalized(row, locale));
}
