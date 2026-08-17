import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import {
  type LocalizedProjectItem,
  type ProjectCategoryKey,
} from "@/data/projects";
import { getPublishedProjects } from "@/lib/projects/store";

async function categoryLabels(
  locale: Locale
): Promise<Record<ProjectCategoryKey, string>> {
  const t = await getTranslations({ locale, namespace: "projects" });
  return {
    personal: t("categories.personal"),
    sold: t("categories.sold"),
  };
}

/** Projets réels publiés en BDD. Aucun contenu de démonstration. */
export async function getSiteProjects(
  locale: Locale
): Promise<LocalizedProjectItem[]> {
  const labels = await categoryLabels(locale);
  return getPublishedProjects(locale, labels);
}

/** Case Study publiée par slug, ou null. */
export async function getSiteProjectBySlug(
  locale: Locale,
  slug: string
): Promise<LocalizedProjectItem | null> {
  const labels = await categoryLabels(locale);
  const { getPublishedProjectBySlug, projectRowToLocalized } = await import(
    "@/lib/projects/store"
  );
  const row = await getPublishedProjectBySlug(slug);
  if (row) {
    return projectRowToLocalized(row, locale, labels[row.kind] ?? row.kind);
  }
  return null;
}
