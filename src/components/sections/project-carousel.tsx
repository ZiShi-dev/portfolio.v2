"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ProjectCard } from "@/components/sections/project-card";
import type { ProjectItem } from "@/components/sections/project-modal";
import type { LocalizedProjectItem } from "@/data/projects";
import { getLocaleDirection, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ProjectCarouselProps = {
  projects: Array<ProjectItem | LocalizedProjectItem>;
  className?: string;
  padded?: boolean;
  showHint?: boolean;
};

export function ProjectCarousel({
  projects,
  className,
  padded = true,
  showHint = true,
}: ProjectCarouselProps) {
  const t = useTranslations("projects");
  const locale = useLocale() as Locale;
  const direction = getLocaleDirection(locale);
  const reduceMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
    direction,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index, Boolean(reduceMotion)), [emblaApi, reduceMotion]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(Boolean(reduceMotion)), [emblaApi, reduceMotion]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(Boolean(reduceMotion)), [emblaApi, reduceMotion]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const frame = window.requestAnimationFrame(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      window.cancelAnimationFrame(frame);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({ direction });
  }, [emblaApi, direction]);

  if (projects.length === 0) return null;

  return (
    <div className={cn("relative", className)} role="region" aria-label={t("title")} aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest("a, input, textarea, select")) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          const next = (event.key === "ArrowRight") === (direction === "ltr");
          if (next) scrollNext(); else scrollPrev();
        }
      }}>

      <div
        className={cn(
          "overflow-hidden select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          padded && "px-4 sm:px-6"
        )}
        tabIndex={0}
        ref={emblaRef}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        <div className="-ms-4 flex sm:-ms-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="min-w-0 shrink-0 grow-0 basis-[92%] ps-4 sm:basis-[78%] sm:ps-6"
            >
              <ProjectCard
                project={project}
                priority={index === 0}
                swipeFriendly
              />
            </div>
          ))}
        </div>
      </div>

      {projects.length > 1 && (
        <div className="mx-auto mt-5 flex w-fit max-w-full items-center justify-center gap-3 rounded-full border border-border-gold bg-surface-elevated/70 px-2 py-1.5 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:mt-6 sm:px-3">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-30"
            aria-label={t("prevProject")}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>

          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
            {projects.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={t("goToProject", { index: index + 1 })}
                aria-current={index === selectedIndex ? "true" : undefined}
                onClick={() => scrollTo(index)}
                className="flex h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span aria-hidden className={cn("h-2 rounded-full transition-[width,background-color] motion-reduce:transition-none",
                  index === selectedIndex ? "w-6 bg-primary" : "w-2 bg-foreground/20 hover:bg-foreground/40"
                )} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-30"
            aria-label={t("nextProject")}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      )}

      {showHint ? (
        <p className="mt-3 text-center text-xs text-foreground/40">
          {t("swipeHint")}
        </p>
      ) : null}
    </div>
  );
}
