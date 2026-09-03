"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { ProjectCarousel } from "@/components/sections/project-carousel";
import { Link } from "@/i18n/navigation";
import type { LocalizedProjectItem } from "@/data/projects";
import { homeProjectRank } from "@/lib/projects/home-order";
import { routes } from "@/lib/routes";

type ProjectDetailMoreProjectsProps = {
  projects: LocalizedProjectItem[];
  currentProjectId: string;
};

export function ProjectDetailMoreProjects({
  projects,
  currentProjectId,
}: ProjectDetailMoreProjectsProps) {
  const t = useTranslations("caseStudy");

  const others = useMemo(
    () =>
      [...projects]
        .filter((item) => item.id !== currentProjectId)
        .sort((a, b) => homeProjectRank(a) - homeProjectRank(b)),
    [projects, currentProjectId]
  );

  if (others.length === 0) {
    return (
      <Reveal delay={0.08}>
        <p className="mt-10 text-center sm:mt-12">
          <Link
            href={routes.projects}
            className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            {t("backToList")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </p>
      </Reveal>
    );
  }

  return (
    <Reveal delay={0.08}>
      <section
        className="mt-10 sm:mt-12"
        aria-labelledby="project-detail-more-heading"
      >
        <div className="mb-6 text-center sm:mb-8">
          <h2
            id="project-detail-more-heading"
            className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
          >
            {t("moreProjectsTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
            {t("moreProjectsSubtitle")}
          </p>
        </div>

        <ProjectCarousel projects={others} padded={false} />

        <p className="mt-6 text-center sm:mt-8">
          <Link
            href={routes.projects}
            className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            {t("backToList")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </p>
      </section>
    </Reveal>
  );
}
