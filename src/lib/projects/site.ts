import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import {
  projectCatalog,
  type LocalizedProjectItem,
  type ProjectCategoryKey,
} from "@/data/projects";
import {
  listPublishedProjectRows,
  projectRowToLocalized,
} from "@/lib/projects/store";

/**
 * Récupère une clé de message optionnelle sans faire échouer le rendu
 * si la clé est absente (messages incomplets sur une locale).
 */
function optionalItemMessage(
  tItems: Awaited<ReturnType<typeof getTranslations>>,
  projectId: string,
  suffix: string
): string | undefined {
  const key = `items.${projectId}.${suffix}`;
  try {
    const v = tItems(key);
    const s = typeof v === "string" ? v.trim() : "";
    return s !== "" ? s : undefined;
  } catch {
    return undefined;
  }
}

function splitLines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function categoryLabels(
  locale: Locale
): Promise<Record<ProjectCategoryKey, string>> {
  const t = await getTranslations({ locale, namespace: "projects" });
  return {
    personal: t("categories.personal"),
    for_sale: t("categories.for_sale"),
    sold: t("categories.sold"),
  };
}

function localizeDemo(
  locale: Locale,
  labels: Record<ProjectCategoryKey, string>,
  tItems: Awaited<ReturnType<typeof getTranslations>>
): LocalizedProjectItem[] {
  return projectCatalog.map((project) => {
    const seoTitle = optionalItemMessage(tItems, project.id, "seoTitle");
    const seoDescription = optionalItemMessage(tItems, project.id, "seoDescription");
    const clientNeed = optionalItemMessage(tItems, project.id, "clientNeed");
    const objective = optionalItemMessage(tItems, project.id, "objective");
    const solution = optionalItemMessage(tItems, project.id, "solution");
    const result = optionalItemMessage(tItems, project.id, "result");
    const listingIntent = optionalItemMessage(tItems, project.id, "listingIntent");
    const technologiesText = optionalItemMessage(tItems, project.id, "technologies");
    const featuresText = optionalItemMessage(tItems, project.id, "features");

    return {
      id: project.id,
      slug: project.id,
      categoryKey: project.categoryKey,
      title: tItems(`items.${project.id}.title`),
      category: labels[project.categoryKey],
      desc: tItems(`items.${project.id}.desc`),
      tags: [],
      businessTypeIds: project.businessTypeIds,
      technologies: splitLines(technologiesText),
      clientNeed,
      objective,
      solution,
      result,
      listingIntent,
      features: splitLines(featuresText),
      seoTitle,
      seoDescription,
      images: project.images.map((image) => ({
        src: image.src,
        label: tItems(`items.${project.id}.images.${image.labelKey}`),
      })),
      link: project.link,
    };
  });
}

/**
 * Projets publiés BDD, sinon catalogue démo localisé.
 */
export async function getSiteProjects(
  locale: Locale
): Promise<LocalizedProjectItem[]> {
  const labels = await categoryLabels(locale);
  const rows = await listPublishedProjectRows();
  if (rows !== null) {
    return rows.map((row) =>
      projectRowToLocalized(row, locale, labels[row.kind] ?? row.kind)
    );
  }

  const tItems = await getTranslations({ locale, namespace: "projects" });
  return localizeDemo(locale, labels, tItems);
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

  // Fallback démo : slug = id catalogue
  const fromDemo = (await getSiteProjects(locale)).find(
    (p) => p.slug === slug || p.id === slug
  );
  // Ne servir le démo que si la BDD n'a aucun publié
  const fromDb = await siteProjectsFromDatabase();
  if (fromDb) return null;
  return fromDemo ?? null;
}

/** true si le site sert la BDD (au moins 1 publié). */
export async function siteProjectsFromDatabase(): Promise<boolean> {
  const rows = await listPublishedProjectRows();
  return Boolean(rows && rows.length > 0);
}
