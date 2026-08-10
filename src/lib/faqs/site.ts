import type { Locale } from "@/i18n/routing";
import {
  faqRowToLocalized,
  listPublishedFaqRowsForService,
  listPublishedGeneralFaqRows,
  type LocalizedFaq,
} from "@/lib/faqs/store";

/** FAQ générales publiées (Home). */
export async function getSiteGeneralFaqs(
  locale: Locale
): Promise<LocalizedFaq[]> {
  const rows = await listPublishedGeneralFaqRows();
  if (!rows) return [];
  return rows.map((row) => faqRowToLocalized(row, locale));
}

/** FAQ publiées associées à une offre (pas tout le catalogue). */
export async function getSiteFaqsForService(
  locale: Locale,
  serviceId: string
): Promise<LocalizedFaq[]> {
  const rows = await listPublishedFaqRowsForService(serviceId);
  if (!rows) return [];
  return rows.map((row) => faqRowToLocalized(row, locale));
}
