"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SpotlightPlate } from "@/components/sections/spotlight-plate";
import type { LocalizedProjectItem } from "@/data/projects";
import { getLocaleDirection, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type SpotlightCarouselProps = {
  projects: LocalizedProjectItem[];
};

export function SpotlightCarousel({ projects }: SpotlightCarouselProps) {
  const t = useTranslations("projects");
  const locale = useLocale() as Locale;
  const direction = getLocaleDirection(locale);
  const multiple = projects.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
    direction,
    skipSnaps: false,
    duration: 28,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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

  if (!multiple) {
    return <SpotlightPlate project={projects[0]} priority />;
  }

  return (
    <div>
      <div
        className="overflow-hidden select-none"
        ref={emblaRef}
        style={{ touchAction: "manipulation" }}
      >
        <div className="flex">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <SpotlightPlate project={project} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-opacity disabled:opacity-30"
          aria-label={t("prevProject")}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>

        <p className="min-w-[4.5rem] text-center font-mono text-[11px] tracking-[0.18em] text-primary/80">
          {t("listingIndex", {
            current: String(selectedIndex + 1).padStart(2, "0"),
            total: String(projects.length).padStart(2, "0"),
          })}
        </p>

        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-opacity disabled:opacity-30"
          aria-label={t("nextProject")}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            aria-label={t("goToProject", { index: index + 1 })}
            aria-current={index === selectedIndex ? "true" : undefined}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-1.5 bg-foreground/25 hover:bg-foreground/40"
            )}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-foreground/40">
        {t("swipeHint")}
      </p>
    </div>
  );
}
