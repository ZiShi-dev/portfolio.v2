"use client";

import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { GlowCard } from "@/components/ui/glow-card";
import { Link } from "@/i18n/navigation";
import type { LocalizedProjectItem } from "@/data/projects";
import { isSafeHttpUrl } from "@/lib/review-schema";
import { routes } from "@/lib/routes";

type CatalogProjectLinkCardProps = {
  project: LocalizedProjectItem;
};

/**
 * Carte lien projet dans la section Services.
 * Affiche la catégorie (perso / vendu) et l’image du projet.
 */
export function CatalogProjectLinkCard({ project }: CatalogProjectLinkCardProps) {
  const t = useTranslations("services");
  const tProjects = useTranslations("projects");
  const cover = project.images[0]?.src;
  const detailHref = `${routes.projects}/${project.slug ?? project.id}`;
  const liveUrl =
    project.link && isSafeHttpUrl(project.link) ? project.link : null;
  const kindLabel =
    project.category ||
    (project.categoryKey
      ? tProjects(`categories.${project.categoryKey}`)
      : t("projectLinkBadge"));

  return (
    <GlowCard className="h-full overflow-hidden p-0">
      <article className="flex h-full flex-col">
        {cover ? (
          <Link
            href={detailHref}
            className="relative block aspect-[16/10] overflow-hidden border-b border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070A12]/85 to-transparent px-4 pb-3 pt-10">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {kindLabel}
              </span>
            </span>
          </Link>
        ) : null}

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {project.reference ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/70">
                {project.reference}
              </span>
            ) : null}
            {!cover ? (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {kindLabel}
              </span>
            ) : null}
          </div>

          <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-foreground sm:text-xl">
            <Link
              href={detailHref}
              className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {project.title}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {project.desc}
          </p>

          <div className="mt-auto flex flex-col gap-2 pt-5">
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary px-4 font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {tProjects("seeSite")}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
            <Link
              href={detailHref}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80 transition-colors hover:text-primary"
            >
              {t("viewProjectLink")}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    </GlowCard>
  );
}
