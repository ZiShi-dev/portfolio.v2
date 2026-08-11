/**
 * Catalogue fixe des types métier (site / appli).
 * Labels i18n : `projects.businessTypes.{id}`
 */
export type ProjectBusinessTypeId =
  | "showcase"
  | "ecommerce"
  | "booking"
  | "landing"
  | "dashboard"
  | "webapp"
  | "blog"
  | "marketplace"
  | "other";

export type ProjectBusinessTypeDef = {
  id: ProjectBusinessTypeId;
  /** Label FR de secours (server / tests) — l’UI utilise i18n. */
  label: string;
};

export const PROJECT_BUSINESS_TYPE_DEFS: readonly ProjectBusinessTypeDef[] = [
  { id: "showcase", label: "Site vitrine" },
  { id: "ecommerce", label: "Boutique en ligne" },
  { id: "booking", label: "Réservation" },
  { id: "landing", label: "Landing page" },
  { id: "dashboard", label: "Tableau de bord" },
  { id: "webapp", label: "Application web" },
  { id: "blog", label: "Blog / contenu" },
  { id: "marketplace", label: "Marketplace" },
  { id: "other", label: "Autre" },
] as const;

const BY_ID = new Map(PROJECT_BUSINESS_TYPE_DEFS.map((t) => [t.id, t]));

export const PROJECT_BUSINESS_TYPE_IDS = PROJECT_BUSINESS_TYPE_DEFS.map(
  (t) => t.id
);

export function isProjectBusinessTypeId(
  value: string
): value is ProjectBusinessTypeId {
  return BY_ID.has(value as ProjectBusinessTypeId);
}

export function getProjectBusinessTypeDef(
  id: string
): ProjectBusinessTypeDef | undefined {
  return BY_ID.get(id as ProjectBusinessTypeId);
}

export function resolveProjectBusinessTypeLabels(ids: string[]): string[] {
  return ids
    .map((id) => getProjectBusinessTypeDef(id)?.label)
    .filter((label): label is string => Boolean(label));
}

/** Id métier depuis un id ou un label FR de secours. */
export function resolveProjectBusinessTypeId(
  value: string
): ProjectBusinessTypeId | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isProjectBusinessTypeId(trimmed)) return trimmed;
  const byLabel = PROJECT_BUSINESS_TYPE_DEFS.find(
    (def) => def.label.toLowerCase() === trimmed.toLowerCase()
  );
  return byLabel?.id ?? null;
}

/**
 * Sépare stack technique et types métier éventuellement collés dans `technologies`/`tags`.
 */
export function partitionProjectTechAndTypes(values: string[]): {
  technologyLabels: string[];
  businessTypeIds: ProjectBusinessTypeId[];
} {
  const technologyLabels: string[] = [];
  const businessTypeIds: ProjectBusinessTypeId[] = [];
  const seenTypes = new Set<ProjectBusinessTypeId>();

  for (const value of values) {
    const typeId = resolveProjectBusinessTypeId(value);
    if (typeId) {
      if (!seenTypes.has(typeId)) {
        seenTypes.add(typeId);
        businessTypeIds.push(typeId);
      }
      continue;
    }
    if (value.trim()) technologyLabels.push(value);
  }

  return { technologyLabels, businessTypeIds };
}
