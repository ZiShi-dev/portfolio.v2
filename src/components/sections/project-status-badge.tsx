"use client";

import { useTranslations } from "next-intl";
import type { ProjectCategoryKey } from "@/data/projects";
import { cn } from "@/lib/utils";

type ProjectStatusBadgeProps = {
  categoryKey: ProjectCategoryKey;
  priceLabel?: string | null;
  className?: string;
};

export function ProjectStatusBadge({
  categoryKey,
  priceLabel,
  className,
}: ProjectStatusBadgeProps) {
  const t = useTranslations("projects");
  const extra =
    categoryKey === "personal" ? null : priceLabel?.trim() || null;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md border border-[rgba(212,175,122,0.22)] bg-[#070A12]/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#F4F1E8] backdrop-blur-sm rtl:font-sans rtl:tracking-normal",
        className
      )}
    >
      <span className="truncate">{t(`categories.${categoryKey}`)}</span>
      {extra ? (
        <>
          <span className="text-primary/55" aria-hidden>
            ·
          </span>
          <span className="truncate text-primary">{extra}</span>
        </>
      ) : null}
    </span>
  );
}
