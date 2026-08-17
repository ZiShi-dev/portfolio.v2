"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LocalizedProjectItem } from "@/data/projects";
import { markHomeForScrollRestore } from "@/lib/lock-body-scroll";
import { HOME_SECTION_PREVIEW } from "@/lib/home-layout";
import { splitHomeProjects } from "@/lib/projects/home-order";
import { routes } from "@/lib/routes";
import { ProjectCard } from "@/components/sections/project-card";
import { ProjectCarousel } from "@/components/sections/project-carousel";
import { SpotlightCarousel } from "@/components/sections/spotlight-carousel";

type ProjectHomeShowcaseProps = {
  projects: LocalizedProjectItem[];
};

export function ProjectHomeShowcase({ projects }: ProjectHomeShowcaseProps) {
  const t = useTranslations("projects");
  const { listings, others } = splitHomeProjects(projects);
  const spotlightSlides =
    listings.length > 0 ? listings : others.slice(0, 1);
  const rest =
    listings.length > 0 ? others : others.slice(1);
  const preview = rest.slice(0, HOME_SECTION_PREVIEW);

  if (spotlightSlides.length === 0) {
    return (
      <p className="px-4 text-center text-sm text-foreground/55 sm:px-6">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 sm:mt-14 sm:px-6">
      <SpotlightCarousel projects={spotlightSlides} />

      {preview.length > 0 ? (
        <div className="mt-10 sm:mt-12">
          <p className="mb-5 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-primary/75">
            {t("otherWork")}
          </p>
          {preview.length === 1 ? (
            <div className="mx-auto max-w-md">
              <ProjectCard project={preview[0]} />
            </div>
          ) : (
            <ProjectCarousel projects={preview} padded={false} showHint={false} />
          )}
        </div>
      ) : null}

      <div className="mt-10 flex justify-center">
        <Button asChild size="lg" variant="outline" className="min-h-12 px-6">
          <Link href={routes.projects} onClick={markHomeForScrollRestore}>
            {t("exploreAll")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
