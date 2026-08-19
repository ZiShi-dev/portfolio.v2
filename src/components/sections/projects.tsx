"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectHomeShowcase } from "@/components/sections/project-home-showcase";
import type { LocalizedProjectItem } from "@/data/projects";

type ProjectsProps = {
  projects: LocalizedProjectItem[];
};

export function Projects({ projects }: ProjectsProps) {
  const t = useTranslations("projects");

  if (projects.length === 0) return null;

  return (
    <section
      id="projets"
      aria-labelledby="projects-heading"
      className="relative scroll-mt-28 overflow-x-clip bg-background py-16 sm:py-24 lg:py-28"
    >
      <div className="px-4 sm:px-6">
        <SectionHeading
          id="projects-heading"
          eyebrow={t("eyebrow")}
          title={
            <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
              <span>{t("title")}</span>
              <span className="text-primary">{t("titleHighlight")}</span>
            </span>
          }
          subtitle={t("subtitle")}
        />
      </div>

      <ProjectHomeShowcase projects={projects} />
    </section>
  );
}
