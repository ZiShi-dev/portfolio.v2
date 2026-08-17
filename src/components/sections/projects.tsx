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
            <>
              {t("title")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </>
          }
          subtitle={t("subtitle")}
        />
      </div>

      <ProjectHomeShowcase projects={projects} />
    </section>
  );
}
