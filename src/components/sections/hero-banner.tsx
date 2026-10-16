"use client";

import { useRef, type Ref } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { usePageVisible } from "@/hooks/use-page-visible";
import { HERO_ARTWORK } from "@/lib/hero-artwork";

type HeroImageProps = { imageRef?: Ref<HTMLImageElement>; priority?: boolean };

/** Serve the precompressed artwork directly; the browser selects one composition. */
function HeroImage({ imageRef, priority = false }: HeroImageProps) {
  return (
    <picture className="block h-full w-full">
      <source media={HERO_ARTWORK.mobileMedia} srcSet={HERO_ARTWORK.mobile.src}
        width={HERO_ARTWORK.mobile.width} height={HERO_ARTWORK.mobile.height} />
      <img ref={imageRef} src={HERO_ARTWORK.desktop.src} alt=""
        width={HERO_ARTWORK.desktop.width} height={HERO_ARTWORK.desktop.height}
        decoding="async" fetchPriority={priority ? "high" : "low"} draggable={false}
        className="h-full w-full object-cover object-center" />
    </picture>
  );
}

function WaterReflection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const reduceMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  if (reduceMotion) return null;
  const animationPlayState = inView && pageVisible ? "running" : "paused";
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="hero-water-reflection absolute inset-0" style={{ animationPlayState }}>
        <HeroImage />
      </div>
      <div className="hero-water-ripples absolute inset-x-0 bottom-0 h-[28%]" style={{ animationPlayState }} />
    </div>
  );
}

export function HeroBanner({ imageRef }: Pick<HeroImageProps, "imageRef">) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background" aria-hidden>
      <div className="hero-image-layer absolute inset-0 opacity-45">
        <HeroImage imageRef={imageRef} priority />
      </div>
      <WaterReflection />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[40%] bg-gradient-to-t from-[rgba(201,169,106,0.12)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-24 bg-gradient-to-b from-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
}
