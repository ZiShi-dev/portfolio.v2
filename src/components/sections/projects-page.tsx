"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageBackBar, pageShellClass } from "@/components/page-back-link";
import { ProjectCard } from "@/components/sections/project-card";
import { useProjectCategoryFilters } from "@/hooks/use-localized-projects";
import {
  PROJECT_BUSINESS_TYPE_IDS,
  type ProjectBusinessTypeId,
} from "@/data/project-business-types";
import { isSafeHttpUrl } from "@/lib/review-schema";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type {
  LocalizedProjectItem,
  ProjectCategoryKey,
} from "@/data/projects";

type CategoryFilter = "all" | ProjectCategoryKey;
type TypeFilter = "all" | ProjectBusinessTypeId;
type LinkFilter = "all" | "site" | "app";

type ProjectsPageProps = {
  projects: LocalizedProjectItem[];
};

export function ProjectsPage({ projects }: ProjectsPageProps) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [linkKind, setLinkKind] = useState<LinkFilter>("all");
  const categories = useProjectCategoryFilters();

  const availableTypes = useMemo(() => {
    const present = new Set<string>();
    for (const p of projects) {
      for (const id of p.businessTypeIds ?? []) present.add(id);
    }
    return PROJECT_BUSINESS_TYPE_IDS.filter((id) => present.has(id));
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      if (category !== "all" && project.categoryKey !== category) return false;
      if (
        type !== "all" &&
        !(project.businessTypeIds ?? []).includes(type)
      ) {
        return false;
      }
      if (linkKind === "site") {
        return Boolean(project.link && isSafeHttpUrl(project.link));
      }
      if (linkKind === "app") {
        return Boolean(project.appLink && isSafeHttpUrl(project.appLink));
      }
      return true;
    });
  }, [projects, category, type, linkKind]);

  const chipClass = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground/60 hover:border-primary/35 hover:text-foreground"
    );

  return (
    <section className="relative overflow-x-clip bg-background pb-20 sm:pb-24 lg:pb-28">
      <PageBackBar href={routes.home} label={tCommon("backHome")} />

      <div className={pageShellClass}>
        <SectionHeading
          className="mt-8"
          eyebrow={t("page.eyebrow")}
          title={
            <>
              {t("page.title")}{" "}
              <span className="text-primary">{t("page.titleHighlight")}</span>
            </>
          }
          subtitle={t("page.subtitle")}
        />

        <Reveal delay={0.1}>
          <div className="mt-8 space-y-4 sm:mt-10 md:mt-12">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={chipClass(category === cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {availableTypes.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setType("all")}
                  className={chipClass(type === "all")}
                >
                  {t("filters.allTypes")}
                </button>
                {availableTypes.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setType(id)}
                    className={chipClass(type === id)}
                  >
                    {t(`businessTypes.${id}`)}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-center gap-2">
              {(
                [
                  ["all", t("filters.allLinks")],
                  ["site", t("filters.withSite")],
                  ["app", t("filters.withApp")],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLinkKind(key)}
                  className={chipClass(linkKind === key)}
                >
                  {key === "app" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5" aria-hidden />
                      {label}
                    </span>
                  ) : key === "site" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      {label}
                    </span>
                  ) : (
                    label
                  )}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 lg:mt-16">
          {filtered.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.06}>
              <ProjectCard project={project} priority={index === 0} />
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-foreground/50">{t("empty")}</p>
        )}
      </div>
    </section>
  );
}
