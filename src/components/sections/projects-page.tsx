"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { homeProjectRank } from "@/lib/projects/home-order";
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
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const sortedProjects = useMemo(() => [...projects].sort((a, b) => homeProjectRank(a) - homeProjectRank(b)), [projects]);
  const categories = useProjectCategoryFilters();

  const availableTypes = useMemo(() => {
    const present = new Set<string>();
    for (const p of projects) {
      for (const id of p.businessTypeIds ?? []) present.add(id);
    }
    return PROJECT_BUSINESS_TYPE_IDS.filter((id) => present.has(id));
  }, [projects]);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return sortedProjects
      .filter((project) => {
        if (category !== "all" && project.categoryKey !== category) return false;
        if (
          type !== "all" &&
          !(project.businessTypeIds ?? []).includes(type)
        ) {
          return false;
        }
        if (linkKind === "site") {
          if (!(project.link && isSafeHttpUrl(project.link))) return false;
        }
        if (linkKind === "app") {
          if (!(project.appLink && isSafeHttpUrl(project.appLink))) return false;
        }
        if (needle) {
          const haystack = `${project.title} ${project.desc}`.toLowerCase();
          if (!haystack.includes(needle)) return false;
        }
        return true;
      });
  }, [sortedProjects, category, type, linkKind, deferredQuery]);

  const hasFilters = category !== "all" || type !== "all" || linkKind !== "all" || query.length > 0;
  function resetFilters() {
    setCategory("all");
    setType("all");
    setLinkKind("all");
    setQuery("");
  }

  return (
    <section className="relative overflow-x-clip bg-background pb-20 sm:pb-24 lg:pb-28">
      <PageBackBar href={routes.home} label={tCommon("backHome")} />

      <div className={pageShellClass}>
        <SectionHeading
          as="h1"
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

        <div className="mt-8 sm:mt-10">
          <details className="group rounded-2xl border border-border bg-surface/40">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:px-5 [&::-webkit-details-marker]:hidden">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{t("filters.refine")}</span>
              {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />}
              <ChevronDown className="ms-auto h-4 w-4 shrink-0 text-primary/70 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
            </summary>
            <div className={cn("grid grid-cols-1 items-end gap-4 border-t border-border p-4 sm:p-5", availableTypes.length > 0 ? "lg:grid-cols-[1.3fr_1.1fr_1fr_1fr]" : "lg:grid-cols-3")}>
              <label className="block min-w-0">
                <span className="mb-2 block text-xs text-muted-foreground">{t("filters.search")}</span>
                <span className="relative block">
                  <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/65" aria-hidden />
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("filters.searchPlaceholder")} aria-controls="project-results" className="min-h-12 w-full rounded-xl border border-border bg-background/60 py-3 ps-10 pe-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/65 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/50" />
                </span>
              </label>
              <div className="min-w-0">
                <ProjectFilterMenu
                  label={t("filters.status")}
                  value={category}
                  onValueChange={(value) => setCategory(value as CategoryFilter)}
                  options={categories.map((cat) => ({
                    value: cat.key,
                    label: cat.label,
                    count: cat.key === "all" ? projects.length : projects.filter((project) => project.categoryKey === cat.key).length,
                  }))}
                />
              </div>
              {availableTypes.length > 0 && (
                <ProjectFilterMenu
                  label={t("filters.projectType")}
                  value={type}
                  onValueChange={(value) => setType(value as TypeFilter)}
                  options={[
                    { value: "all", label: t("filters.allTypes") },
                    ...availableTypes.map((id) => ({ value: id, label: t(`businessTypes.${id}`) })),
                  ]}
                />
              )}
              <ProjectFilterMenu
                label={t("filters.projectAccess")}
                value={linkKind}
                onValueChange={(value) => setLinkKind(value as LinkFilter)}
                options={[
                  { value: "all", label: t("filters.allLinks") },
                  { value: "site", label: t("filters.withSite") },
                  { value: "app", label: t("filters.withApp") },
                ]}
              />
            </div>
          </details>
          <div className="mt-3 flex min-h-11 items-center justify-between gap-3 px-1">
            <p role="status" aria-live="polite" aria-atomic="true" className="text-xs text-muted-foreground">{t("filters.results", { count: filtered.length })}</p>
            <button type="button" disabled={!hasFilters} onClick={resetFilters} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default disabled:text-muted-foreground/40 disabled:hover:bg-transparent"><RotateCcw className="h-3.5 w-3.5" aria-hidden />{t("filters.reset")}</button>
          </div>
        </div>
        <div id="project-results" aria-busy={query !== deferredQuery} className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:grid-cols-2">
          {filtered.map((project, index) => (
            <Reveal key={project.id} delay={Math.min(index, 4) * 0.04} variant="fade" className="h-full">
              <ProjectCard project={project} priority={index === 0} />
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-border px-5 py-12 text-center"><Search className="mx-auto h-6 w-6 text-primary/60" aria-hidden /><p className="mt-4 font-medium text-foreground">{t("filters.noResults")}</p><p className="mt-2 text-sm text-muted-foreground">{t("filters.emptyHint")}</p></div>
        )}
      </div>
    </section>
  );
}

function ProjectFilterMenu({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; count?: number }[];
}) {
  const locale = useLocale();

  return (
    <div className="min-w-0">
      <span className="mb-2 block text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onValueChange} dir={locale === "ar" ? "rtl" : "ltr"}>
        <SelectTrigger
          aria-label={label}
          className="h-12 rounded-xl border-border bg-background/60 px-3 text-xs text-foreground hover:border-primary/40 focus-visible:ring-primary/50 data-[state=open]:border-primary/60 data-[state=open]:bg-primary/5 [&>svg]:text-primary [&>svg]:transition-transform [&[data-state=open]>svg]:rotate-180 sm:text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          sideOffset={6}
          className="rounded-2xl border-primary/25 bg-[#0c101b] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.45)] motion-reduce:animate-none"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-11 cursor-pointer rounded-xl py-3 ps-3 pe-9 text-sm text-muted-foreground transition-colors focus:bg-primary/10 focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary [&>span:first-child]:text-primary"
            >
              <span className="inline-flex items-center gap-2">
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <span aria-hidden className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary/80">{option.count}</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
