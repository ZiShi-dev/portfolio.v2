"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
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

type RowConfig = {
  reverse?: boolean;
  compact?: boolean;
  durationSec: number;
};

const ROWS: RowConfig[] = [
  { durationSec: 42 },
  { reverse: true, compact: true, durationSec: 48 },
  { durationSec: 38 },
];

/** Duplique la liste pour un défilement fluide (même avec 1–2 projets). */
function buildTrack(
  items: LocalizedProjectItem[],
  rowIndex: number,
  copies = 6
): LocalizedProjectItem[] {
  if (items.length === 0) return [];
  const offset = rowIndex % items.length;
  const rotated = [...items.slice(offset), ...items.slice(0, offset)];
  const out: LocalizedProjectItem[] = [];
  for (let c = 0; c < copies; c++) out.push(...rotated);
  return out;
}

function ProjectCard({
  project,
  compact,
  className,
}: {
  project: LocalizedProjectItem;
  compact?: boolean;
  className?: string;
}) {
  const t = useTranslations("projects");
  const href = `${routes.projects}/${project.slug ?? project.id}`;
  const cover = project.images[0]?.src;

  return (
    <Link
      href={href}
      aria-label={t("openDetails", { title: project.title })}
      className={cn(
        "group relative block shrink-0 overflow-hidden rounded-2xl border border-[rgba(244,241,232,0.10)] bg-[#0D1322]",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-[rgba(212,175,122,0.28)] hover:shadow-[0_0_24px_rgba(201,169,106,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]",
        compact ? "w-[220px] sm:w-[250px]" : "w-[260px] sm:w-[300px]",
        className
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
            sizes="300px"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#101828] to-[#070A12]" />
        )}
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
        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </Link>
    </Button>
  );
}

function ProjectGrid({ projects }: { projects: LocalizedProjectItem[] }) {
  return (
    <div className="relative mt-10 sm:mt-14">
      <ul
        className={cn(
          "mx-auto grid max-w-5xl list-none justify-center gap-5 px-4 sm:px-6",
          projects.length === 1 && "grid-cols-1 max-w-sm",
          projects.length === 2 && "grid-cols-1 sm:grid-cols-2",
          projects.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {projects.map((project) => (
          <li key={project.id} className="flex justify-center">
            <ProjectCard project={project} className="w-full max-w-[300px]" />
          </li>
        ))}
      </ul>
      <div className="mt-10 flex justify-center px-4">
        <ExploreAllButton />
      </div>
    </div>
  );
}

/** Scroll manuel mobile (pas d’animation CSS — taps fiables). */
function MobileStrip({ projects }: { projects: LocalizedProjectItem[] }) {
  const few = projects.length <= 2;

  return (
    <div className="mt-10 lg:hidden">
      <div
        dir="ltr"
        className={cn(
          "flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6",
          "snap-x snap-mandatory",
          "[scrollbar-width:thin] [scrollbar-color:rgba(201,169,106,0.35)_transparent]",
          few && "justify-center"
        )}
      >
        {projects.map((project) => (
          <div key={project.id} className="snap-center shrink-0">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center px-4">
        <ExploreAllButton />
      </div>
    </div>
  );
}

/** Une rangée de défilement CSS (indépendante de react-fast-marquee / RTL). */
function ScrollRow({
  projects,
  rowIndex,
  reverse,
  compact,
  durationSec,
}: {
  projects: LocalizedProjectItem[];
  rowIndex: number;
  reverse?: boolean;
  compact?: boolean;
  durationSec: number;
}) {
  const track = buildTrack(projects, rowIndex);

  return (
    <div className="project-scroll-row relative w-full overflow-hidden" dir="ltr">
      <div
        className={cn(
          "project-scroll-track flex w-max gap-3 sm:gap-4",
          reverse && "project-scroll-track--reverse"
        )}
        style={{ ["--project-scroll-duration" as string]: `${durationSec}s` }}
      >
        {/* Deux segments identiques pour une boucle seamless */}
        {[0, 1].map((segment) => (
          <div
            key={segment}
            className="flex shrink-0 gap-3 sm:gap-4"
            aria-hidden={segment === 1 ? true : undefined}
          >
            {track.map((project, idx) => (
              <ProjectCard
                key={`${segment}-${project.id}-${idx}`}
                project={project}
                compact={compact}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Section projets Home — défilement CSS (fiable LTR/RTL).
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
    return <ProjectGrid projects={projects} />;
  }

  return (
    <>
      <MobileStrip projects={projects} />

      <div className="relative mt-10 hidden w-full sm:mt-14 lg:block">
        <div className="space-y-4">
          {ROWS.map((row, i) => (
            <ScrollRow
              key={i}
              projects={projects}
              rowIndex={i}
              reverse={row.reverse}
              compact={row.compact}
              durationSec={row.durationSec}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,14,26,0.55)_0%,transparent_65%)]"
            aria-hidden
          />
          <div className="pointer-events-auto relative">
            <ExploreAllButton />
          </div>
        </div>
      </div>
    </>
  );
}
