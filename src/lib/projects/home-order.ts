import type { LocalizedProjectItem } from "@/data/projects";

/** Plus le rang est bas, plus le projet est visible pour un visiteur. */
export function homeProjectRank(project: LocalizedProjectItem): number {
  if (project.categoryKey === "for_sale") return project.featured ? 0 : 1;
  if (project.featured) return 2;
  return 3;
}

export function splitHomeProjects(projects: LocalizedProjectItem[]): {
  listings: LocalizedProjectItem[];
  others: LocalizedProjectItem[];
} {
  const ranked = [...projects].sort(
    (a, b) => homeProjectRank(a) - homeProjectRank(b)
  );
  return {
    listings: ranked.filter((project) => project.categoryKey === "for_sale"),
    others: ranked.filter((project) => project.categoryKey !== "for_sale"),
  };
}

export function partitionHomeProjects(projects: LocalizedProjectItem[]): {
  spotlight: LocalizedProjectItem | null;
  rest: LocalizedProjectItem[];
} {
  const { listings, others } = splitHomeProjects(projects);
  const ranked = [...listings, ...others];
  const spotlight = ranked[0] ?? null;
  return { spotlight, rest: ranked.slice(1) };
}
