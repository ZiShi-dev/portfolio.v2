"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LocalizedProjectItem } from "@/data/projects";
import { markHomeForScrollRestore } from "@/lib/lock-body-scroll";
import { routes } from "@/lib/routes";
import { ProjectStatusBadge } from "@/components/sections/project-status-badge";
import { ProjectTypeBadges } from "@/components/sections/project-type-badges";

type SpotlightPlateProps = {
  project: LocalizedProjectItem;
  priority?: boolean;
};

export function SpotlightPlate({ project, priority }: SpotlightPlateProps) {
  const t = useTranslations("projects");
  const href = `${routes.projects}/${project.slug ?? project.id}`;
  const cover = project.images[0]?.src;
  const forSale = project.categoryKey === "for_sale";

  return (
    <article className="overflow-hidden rounded-2xl border border-border-gold bg-surface-elevated shadow-[0_22px_60px_-38px_rgba(0,0,0,0.95)]">
      <div className="grid lg:grid-cols-2">
        <figure className="relative aspect-[4/3] bg-[#0A0E1A] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#101828] to-[#070A12]" />
          )}
          <div className="absolute start-3 top-3 z-10 sm:start-4 sm:top-4">
            <ProjectStatusBadge
              categoryKey={project.categoryKey}
              priceLabel={project.listingPriceLabel}
            />
          </div>
        </figure>

        <div className="min-w-0 flex flex-col justify-center p-5 text-start sm:p-8 lg:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary rtl:font-sans rtl:tracking-normal">
            {forSale ? t("availableNow") : project.reference ?? t("eyebrow")}
          </p>
          <h3 className="mt-2.5 break-words font-display text-2xl font-semibold leading-tight tracking-tight text-foreground rtl:tracking-normal sm:mt-3 sm:text-3xl">
            {project.title}
          </h3>
          {project.listingPriceLabel ? (
            <p className="mt-3 font-mono text-xl tracking-wide text-primary rtl:font-sans rtl:tracking-normal sm:text-2xl">
              {project.listingPriceLabel}
            </p>
          ) : null}
          <ProjectTypeBadges
            businessTypeIds={project.businessTypeIds}
            className="mt-4"
          />
          {project.desc ? (
            <p className="mt-4 line-clamp-3 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base sm:leading-relaxed">
              {project.desc}
            </p>
          ) : null}
          <div className="mt-6 sm:mt-8">
            <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
              <Link href={href} onClick={markHomeForScrollRestore}>
                {forSale ? t("viewListing") : t("viewProject")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
