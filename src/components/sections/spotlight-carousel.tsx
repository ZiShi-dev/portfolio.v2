"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SpotlightPlate } from "@/components/sections/spotlight-plate";
import type { LocalizedProjectItem } from "@/data/projects";
import { getLocaleDirection, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { usePageVisible } from "@/hooks/use-page-visible";

const AUTOPLAY_DELAY_MS = 6000;

type SpotlightCarouselProps = {
  projects: LocalizedProjectItem[];
};

export function SpotlightCarousel({ projects }: SpotlightCarouselProps) {
  const t = useTranslations("projects");
  const locale = useLocale() as Locale;
  const direction = getLocaleDirection(locale);
  const reduceMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const multiple = projects.length > 1;
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.25 });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: multiple,
    containScroll: "trimSnaps",
    direction,
    skipSnaps: false,
    duration: reduceMotion ? 0 : 22,
    dragThreshold: 8,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index, Boolean(reduceMotion)),
    [emblaApi, reduceMotion]
  );
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
    emblaApi.reInit({ direction, loop: multiple, duration: reduceMotion ? 0 : 22 });
  }, [emblaApi, direction, multiple, reduceMotion]);

  useEffect(() => {
    if (!emblaApi || !multiple || reduceMotion || autoplayPaused || !inView || !pageVisible) return;
    const desktop = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    let timer: number | undefined;
    const syncTimer = () => {
      window.clearInterval(timer);
      if (desktop.matches) timer = window.setInterval(() => emblaApi.scrollNext(), AUTOPLAY_DELAY_MS);
    };
    syncTimer();
    desktop.addEventListener("change", syncTimer);
    return () => {
      window.clearInterval(timer);
      desktop.removeEventListener("change", syncTimer);
    };
  }, [emblaApi, multiple, reduceMotion, autoplayPaused, inView, pageVisible]);

  if (projects.length === 0) return null;

  if (!multiple) {
    return <SpotlightPlate project={projects[0]} />;
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={t("title")}
      aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest("a, input, textarea, select")) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          const next = (event.key === "ArrowRight") === (direction === "ltr");
          if (next) scrollNext(); else scrollPrev();
        }
      }}
      onMouseEnter={() => setAutoplayPaused(true)}
      onMouseLeave={(event) => setAutoplayPaused(event.currentTarget.contains(document.activeElement))}
      onFocusCapture={() => setAutoplayPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setAutoplayPaused(event.currentTarget.matches(":hover"));
        }
      }}
      onPointerDown={() => setAutoplayPaused(true)}
      onPointerUp={(event) => setAutoplayPaused(event.currentTarget.matches(":hover") || event.currentTarget.contains(document.activeElement))}
      onPointerCancel={(event) => setAutoplayPaused(event.currentTarget.matches(":hover") || event.currentTarget.contains(document.activeElement))}
    >
      <div
        className="overflow-hidden select-none rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        tabIndex={0}
        ref={emblaRef}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        <div className="-ms-4 flex items-stretch sm:-ms-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              role="group"
              aria-label={t("listingIndex", { current: String(index + 1).padStart(2, "0"), total: String(projects.length).padStart(2, "0") })}
              inert={index !== selectedIndex}
              className="min-w-0 shrink-0 grow-0 basis-full ps-4 sm:ps-6"
            >
              <SpotlightPlate project={project} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-30"
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
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-30"
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
            className="flex h-11 min-w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <span aria-hidden className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none",
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-1.5 bg-foreground/25 hover:bg-foreground/40"
            )} />
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-foreground/40">
        {t("swipeHint")}
      </p>
    </div>
  );
}
