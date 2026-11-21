"use client";

import { useTranslations } from "next-intl";
import { HeadingTitle } from "@/components/ui/heading-title";
import { Reveal } from "@/components/ui/reveal";
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
      className="relative flex scroll-mt-28 flex-col justify-center overflow-x-clip bg-background px-4 py-16 sm:px-6 sm:py-20 lg:py-20"
    >
      <SectionHeading
        id="projects-heading"
        title={<HeadingTitle title={t("title")} highlight={t("titleHighlight")} />}
        subtitle={t("subtitle")}
      />

      <Reveal variant="rise">
        <ProjectHomeShowcase projects={projects} />
      </Reveal>
    </section>
  );
}
