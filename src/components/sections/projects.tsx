"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectMarquee } from "@/components/sections/project-marquee";
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
      className="relative scroll-mt-28 overflow-x-clip bg-surface py-16 sm:py-24 lg:py-28"
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

      {/* Hors Reveal : transform/overflow casse le calcul de largeur du marquee */}
      <ProjectMarquee projects={projects} />
    </section>
  );
}
