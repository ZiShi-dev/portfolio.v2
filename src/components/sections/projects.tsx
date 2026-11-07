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
      className="relative flex min-h-[100dvh] scroll-mt-28 flex-col justify-center overflow-x-clip bg-background py-16 sm:py-24 lg:py-28"
    >
      <div className="px-4 sm:px-6">
        <SectionHeading
          id="projects-heading"
          eyebrow={t("eyebrow")}
          title={<HeadingTitle title={t("title")} highlight={t("titleHighlight")} />}
          subtitle={t("subtitle")}
        />
      </div>

      <Reveal variant="rise">
        <ProjectHomeShowcase projects={projects} />
      </Reveal>
    </section>
  );
}
