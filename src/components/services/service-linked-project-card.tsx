"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { GlowCard } from "@/components/ui/glow-card";
import { Link } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
import type { LinkedOfferProject } from "@/lib/services/site";
import { ProjectStatusBadge } from "@/components/sections/project-status-badge";

type ServiceLinkedProjectCardProps = {
  project: LinkedOfferProject;
};

/** Carte projet sur la page détail d’offre — image + texte, lien vers /projets/[slug]. */
export function ServiceLinkedProjectCard({
  project,
}: ServiceLinkedProjectCardProps) {
  const t = useTranslations("services");
  const href = `${routes.projects}/${project.slug}`;

  return (
    <GlowCard className="h-full overflow-hidden p-0">
      <Link
        href={href}
        className="group flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
      >
        {project.image ? (
          <span className="relative block aspect-[16/10] overflow-hidden border-b border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute start-3 top-3 z-10">
              <ProjectStatusBadge
                categoryKey={project.categoryKey}
                priceLabel={project.listingPriceLabel}
              />
            </span>
          </span>
        ) : (
          <span className="px-5 pt-5 sm:px-6 sm:pt-6">
            <ProjectStatusBadge
              categoryKey={project.categoryKey}
              priceLabel={project.listingPriceLabel}
            />
          </span>
        )}
        <span className="flex flex-1 flex-col p-5 sm:p-6">
          {project.reference ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">
              {project.reference}
            </span>
          ) : null}
          <span className="mt-2 font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl">
            {project.title}
          </span>
          {project.description ? (
            <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </span>
          ) : null}
          <span className="mt-auto inline-flex min-h-10 items-center gap-1.5 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
            {t("viewLinkedProject")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </span>
      </Link>
    </GlowCard>
  );
}
