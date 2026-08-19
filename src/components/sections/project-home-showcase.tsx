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

  if (spotlightSlides.length === 0) return null;

  return (
    <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-14 sm:px-6">
      <SpotlightCarousel projects={spotlightSlides} />

      {preview.length > 0 ? (
        <div className="mt-9 sm:mt-12">
          <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-primary/75 rtl:font-sans rtl:tracking-normal sm:mb-5">
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

      <div className="mt-9 flex justify-center sm:mt-10">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="min-h-12 w-full px-6 sm:w-auto"
        >
          <Link href={routes.projects} onClick={markHomeForScrollRestore}>
            {t("exploreAll")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
