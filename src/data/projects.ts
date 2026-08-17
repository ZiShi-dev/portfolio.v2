import type { ProjectItem } from "@/components/sections/project-modal";

export type ProjectCategoryKey = "personal" | "sold";

export type ProjectCatalogItem = {
  id: string;
  categoryKey: ProjectCategoryKey;
  businessTypeIds: string[];
  images: { src: string; labelKey: string }[];
  link?: string;
};

/** Aucun projet de démonstration : le site affiche uniquement les projets réels. */
export const projectCatalog: ProjectCatalogItem[] = [];

export type LocalizedProjectItem = ProjectItem & {
  categoryKey: ProjectCategoryKey;
};

export function getProjectCategoryKeys(): ProjectCategoryKey[] {
  return ["personal", "sold"];
}

/** @deprecated Utiliser useLocalizedProjects() / getSiteProjects(). */
export const projects: ProjectItem[] = projectCatalog.map((project) => ({
  id: project.id,
  title: project.id,
  category: project.categoryKey,
  desc: "",
  tags: [],
  businessTypeIds: project.businessTypeIds,
  images: project.images.map((image) => ({
    src: image.src,
    label: image.labelKey,
  })),
  link: project.link,
}));

export function getProjectCategories() {
  return getProjectCategoryKeys();
}
