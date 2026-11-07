"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LocalizedProjectItem } from "@/data/projects";
import { homeProjectRank } from "@/lib/projects/home-order";
import { routes } from "@/lib/routes";
import { SpotlightPlate } from "@/components/sections/spotlight-plate";

type ProjectHomeShowcaseProps = {
  projects: LocalizedProjectItem[];
};

export function ProjectHomeShowcase({ projects }: ProjectHomeShowcaseProps) {
  const t = useTranslations("projects");
  const sorted = [...projects].sort(
    (a, b) => homeProjectRank(a) - homeProjectRank(b)
  );

  const lead = sorted[0];
  if (!lead) return null;

  return (
    <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-10 sm:px-6">
      <SpotlightPlate project={lead} priority featured />

      <div className="mt-9 flex justify-center sm:mt-10">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="min-h-12 w-full px-6 sm:w-auto"
        >
          <Link href={routes.projects}>
            {t("exploreAll")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
