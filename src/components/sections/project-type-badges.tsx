"use client";

import { useTranslations } from "next-intl";
import { getProjectBusinessType } from "@/data/project-business-type-icons";
import { isProjectBusinessTypeId } from "@/data/project-business-types";
import { cn } from "@/lib/utils";

type ProjectTypeBadgesProps = {
  businessTypeIds?: string[];
  /** Stack technique libre (non i18n). */
  tags?: string[];
  className?: string;
};

export function ProjectTypeBadges({
  businessTypeIds,
  tags,
  className,
}: ProjectTypeBadgesProps) {
  const t = useTranslations("projects.businessTypes");
  const typeIds = (businessTypeIds ?? []).filter(isProjectBusinessTypeId);
  const techTags = (tags ?? []).filter((label) => label.trim() !== "");

  if (typeIds.length === 0 && techTags.length === 0) return null;

  return (
    <div className={cn("mt-4 flex flex-wrap gap-2", className)}>
      {typeIds.map((id) => {
        const type = getProjectBusinessType(id);
        if (!type) return null;
        const Icon = type.Icon;
        return (
          <span
            key={`type-${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-step-accent/25 bg-background/70 px-3 py-1 text-xs text-foreground/70"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
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
