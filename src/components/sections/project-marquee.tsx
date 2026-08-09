"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Marquee from "react-fast-marquee";
import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LocalizedProjectItem } from "@/data/projects";
import { markHomeForScrollRestore } from "@/lib/lock-body-scroll";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ProjectMarqueeProps = {
  projects: LocalizedProjectItem[];
};

const MARQUEE_SURFACE = "#0A0E1A";

const ROWS = [
  { direction: "left" as const, speed: 35 },
  { direction: "right" as const, speed: 42 },
  { direction: "left" as const, speed: 30 },
];

/** Assez de cartes pour remplir toute la largeur (évite le “tas” à gauche). */
function fillRow(
  items: LocalizedProjectItem[],
  rowIndex: number,
  minCount = 10
): LocalizedProjectItem[] {
  if (items.length === 0) return [];
  const offset = rowIndex % items.length;
  const rotated = [...items.slice(offset), ...items.slice(0, offset)];
  const out: LocalizedProjectItem[] = [];
  while (out.length < minCount) {
    out.push(...rotated);
  }
  return out;
}

function MarqueeCard({
  project,
  compact,
}: {
  project: LocalizedProjectItem;
  compact?: boolean;
}) {
  const t = useTranslations("projects");
  const href = `${routes.projects}/${project.slug ?? project.id}`;
  const cover = project.images[0]?.src;

  return (
    <Link
      href={href}
      aria-label={t("openDetails", { title: project.title })}
      className={cn(
        "group relative mx-2 block shrink-0 overflow-hidden rounded-2xl border border-[rgba(244,241,232,0.10)] bg-[#0D1322] sm:mx-2.5",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-[rgba(212,175,122,0.28)] hover:shadow-[0_0_24px_rgba(201,169,106,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]",
        compact ? "w-[230px] sm:w-[260px]" : "w-[270px] sm:w-[310px]"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[#0A0E1A]",
          compact ? "aspect-[16/11]" : "aspect-[16/10]"
        )}
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="310px"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070A12]/85 via-transparent to-transparent" />
      </div>
      <div className="space-y-1 px-3.5 py-3 text-center sm:px-4 sm:py-3.5">
        {project.reference ? (
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary/75">
            {project.reference}
          </p>
        ) : (
          <p className="text-[10px] uppercase tracking-widest text-foreground/45">
            {project.category}
          </p>
        )}
        <h3 className="line-clamp-1 font-display-serif text-sm font-semibold text-[#F4F1E8] sm:text-base">
          {project.title}
        </h3>
      </div>
    </Link>
  );
}

function ExploreAllButton() {
  const t = useTranslations("projects");

  return (
    <Button asChild size="lg" className="min-h-12 px-6">
      <Link href={routes.projects} onClick={markHomeForScrollRestore}>
        {t("exploreAll")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Button>
  );
}

/**
 * Mobile / tablette : défilement manuel (snap).
 * Les liens CSS animés du marquee ne reçoivent souvent pas le tap.
 */
function MobileProjectStrip({ projects }: { projects: LocalizedProjectItem[] }) {
  return (
    <div className="relative mt-10 sm:mt-14 lg:hidden">
      <div
        className={cn(
          "flex gap-1 overflow-x-auto px-2 pb-3 sm:gap-2 sm:px-4",
          "snap-x snap-mandatory scroll-smooth",
          "[scrollbar-width:thin] [scrollbar-color:rgba(201,169,106,0.35)_transparent]",
          "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-[rgba(201,169,106,0.35)]"
        )}
      >
        {projects.map((project) => (
          <div key={project.id} className="snap-center shrink-0 first:ms-2 last:me-2 sm:first:ms-0 sm:last:me-0">
            <MarqueeCard project={project} />
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center px-4">
        <ExploreAllButton />
      </div>
    </div>
  );
}

/**
 * Mur de projets — marquee desktop ; strip scrollable en responsive
 * (évite les taps perdus sur des cartes en animation CSS).
 */
export function ProjectMarquee({ projects }: ProjectMarqueeProps) {
  const t = useTranslations("projects");
  const reducedMotion = useReducedMotion();

  if (projects.length === 0) {
    return (
      <p className="px-4 text-center text-sm text-foreground/55 sm:px-6">
        {t("empty")}
      </p>
    );
  }

  if (reducedMotion) {
    return (
      <div className="relative mt-10 sm:mt-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          {projects.slice(0, 6).map((p) => (
            <div key={p.id} className="flex justify-center">
              <MarqueeCard project={p} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center px-4">
          <ExploreAllButton />
        </div>
      </div>
    );
  }

  return (
    <>
      <MobileProjectStrip projects={projects} />

      <div
        className="relative mt-10 hidden w-full sm:mt-14 lg:block"
        // LTR forcé : sous dir=rtl le flex du marquee se casse (contenu collé à gauche).
        dir="ltr"
      >
        <div className="space-y-3 sm:space-y-4">
          {ROWS.map((row, i) => (
            <Marquee
              key={i}
              className="project-marquee-row w-full overflow-hidden [&_.rfm-overlay]:pointer-events-none"
              direction={row.direction}
              speed={row.speed}
              autoFill
              pauseOnHover
              pauseOnClick
              gradient
              gradientColor={MARQUEE_SURFACE}
              gradientWidth="12%"
            >
              {fillRow(projects, i).map((project, idx) => (
                <MarqueeCard
                  key={`${project.id}-${i}-${idx}`}
                  project={project}
                  compact={i === 1}
                />
              ))}
            </Marquee>
          ))}
        </div>

        {/* CTA centré : pointer-events uniquement sur le bouton */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,14,26,0.5)_0%,transparent_62%)]"
            aria-hidden
          />
          <div className="pointer-events-auto relative shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
            <ExploreAllButton />
          </div>
        </div>
      </div>
    </>
  );
}
