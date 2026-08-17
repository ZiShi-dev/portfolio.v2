"use client";

import { useTranslations } from "next-intl";
import { getProjectBusinessType } from "@/data/project-business-type-icons";
import {
  isProjectBusinessTypeId,
  partitionProjectTechAndTypes,
  type ProjectBusinessTypeId,
} from "@/data/project-business-types";
import { cn } from "@/lib/utils";

type ProjectTypeBadgesProps = {
  businessTypeIds?: string[];
  /** Stack technique libre — les labels métier FR/EN y sont filtrés et traduits. */
  tags?: string[];
  className?: string;
  /** `line` : une ligne catalogue (cartes home). */
  variant?: "pills" | "line";
};

function resolveTypeIds(
  businessTypeIds?: string[],
  tags?: string[]
): ProjectBusinessTypeId[] {
  const partitioned = partitionProjectTechAndTypes(tags ?? []);
  return Array.from(
    new Set([
      ...(businessTypeIds ?? []).filter(isProjectBusinessTypeId),
      ...partitioned.businessTypeIds,
    ])
  );
}

export function ProjectTypeBadges({
  businessTypeIds,
  tags,
  className,
  variant = "pills",
}: ProjectTypeBadgesProps) {
  const t = useTranslations("projects.businessTypes");
  const partitioned = partitionProjectTechAndTypes(tags ?? []);
  const typeIds = resolveTypeIds(businessTypeIds, tags);
  const techTags = partitioned.technologyLabels;

  if (typeIds.length === 0 && techTags.length === 0) return null;

  if (variant === "line") {
    const labels = typeIds.map((id) => t(id));
    return (
      <p
        className={cn(
          "line-clamp-1 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground/55",
          className
        )}
      >
        {labels.join(" · ")}
      </p>
    );
  }

  return (
    <div className={cn("mt-4 flex flex-wrap gap-2", className)}>
      {typeIds.map((id) => {
        const type = getProjectBusinessType(id);
        if (!type) return null;
        const Icon = type.Icon;
        return (
          <span
            key={`type-${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(212,175,122,0.22)] bg-[#0D1322] px-3 py-1 text-xs text-[#F4F1E8]/85"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
            {t(id)}
          </span>
        );
      })}
      {techTags.map((label) => (
        <span
          key={`tag-${label}`}
          className="rounded-full border border-border bg-muted/80 px-3 py-1 text-xs text-foreground/55"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
