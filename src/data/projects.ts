import type { ProjectItem } from "@/components/sections/project-modal";

export type ProjectCategoryKey = "personal" | "for_sale" | "sold";

export type ProjectCatalogItem = {
  id: string;
  categoryKey: ProjectCategoryKey;
  businessTypeIds: string[];
  images: { src: string; labelKey: string }[];
  link?: string;
};

/** Fallback local si la BDD n’a aucun projet publié — uniquement des projets réels. */
export const projectCatalog: ProjectCatalogItem[] = [
  {
    id: "quotishop",
    categoryKey: "for_sale",
    businessTypeIds: ["ecommerce"],
    images: [],
    link: "https://quotishop-five.vercel.app/",
  },
  {
    id: "savoraille",
    categoryKey: "personal",
    businessTypeIds: ["showcase", "booking"],
    images: [{ src: "/projects/savoraille-hero.png", labelKey: "hero" }],
    link: "https://savoraille.vorzix.com/fr",
  },
];

export type LocalizedProjectItem = ProjectItem & {
  categoryKey: ProjectCategoryKey;
};

export function getProjectCategoryKeys(): ProjectCategoryKey[] {
  return ["personal", "for_sale", "sold"];
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
