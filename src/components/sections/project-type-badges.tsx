"use client";

import { useTranslations } from "next-intl";
import { getProjectBusinessType } from "@/data/project-business-type-icons";
import { isProjectBusinessTypeId } from "@/data/project-business-types";
import { cn } from "@/lib/utils";

type ProjectTypeBadgesProps = {
  businessTypeIds?: string[];
  /** Stack / technologies (affiché en complément des types métier). */
  tags?: string[];
  className?: string;
};

export function ProjectTypeBadges({
  businessTypeIds,
  tags,
  className,
}: ProjectTypeBadgesProps) {
  const t = useTranslations("projects.businessTypes");
  const hasTypes = Boolean(businessTypeIds?.length);
  const hasTags = Boolean(tags?.length);

  if (!hasTypes && !hasTags) return null;

  return (
    <div className={cn("mt-4 flex flex-wrap gap-2", className)}>
      {businessTypeIds?.map((id) => {
        const type = getProjectBusinessType(id);
        if (!type) return null;
        const Icon = type.Icon;
        const label = isProjectBusinessTypeId(id) ? t(id) : type.label;
        return (
          <span
            key={`type-${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-step-accent/25 bg-background/70 px-3 py-1 text-xs text-foreground/70"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {label}
          </span>
        );
      })}
      {tags?.map((label) => (
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
