"use client";

import { useCallback, useEffect, useState, type Ref } from "react";
import dynamic from "next/dynamic";
import { HERO_ARTWORK } from "@/lib/hero-artwork";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const HeroDepthField = dynamic(
  () => import("@/components/sections/hero-depth-field").then((mod) => mod.HeroDepthField),
  { ssr: false },
);

type HeroImageProps = {
  imageRef?: Ref<HTMLImageElement>;
  priority?: boolean;
  hidden?: boolean;
};

/** Téléphone, tablette étroite, réseau lent ou peu de mémoire : la photo reste fixe. */
function canEnhanceHero() {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.connection?.saveData) return false;
  const network = nav.connection?.effectiveType;
  if (network === "slow-2g" || network === "2g" || network === "3g") return false;
  if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return false;
  if (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.matchMedia("(max-width: 900px)").matches) return false;
  return true;
}

/** Photo actuelle. Elle reste visible tant que la scène de profondeur n’est pas prête. */
function HeroImage({ imageRef, priority = false, hidden = false }: HeroImageProps) {
  return (
    <picture className={hidden ? "block h-full w-full opacity-0" : "block h-full w-full"}>
      <source
        media={HERO_ARTWORK.mobileMedia}
        srcSet={HERO_ARTWORK.mobile.src}
        width={HERO_ARTWORK.mobile.width}
        height={HERO_ARTWORK.mobile.height}
      />
      <img
        ref={imageRef}
        src={HERO_ARTWORK.desktop.src}
        alt=""
        width={HERO_ARTWORK.desktop.width}
        height={HERO_ARTWORK.desktop.height}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        draggable={false}
        className="h-full w-full object-cover object-center"
      />
    </picture>
  );
}

export function HeroBanner({ imageRef }: Pick<HeroImageProps, "imageRef">) {
  const reduceMotion = useReducedMotion();
  const [enhance, setEnhance] = useState(false);
  const [live, setLive] = useState(false);
  const markLive = useCallback(() => setLive(true), []);
  const markFallback = useCallback(() => setLive(false), []);

  useEffect(() => {
    if (reduceMotion || !canEnhanceHero()) return;
    let timer: number | undefined;
    let idle: number | undefined;
    const start = () => setEnhance(true);
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(start, { timeout: 1200 });
    } else {
      timer = window.setTimeout(start, 400);
    }
    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reduceMotion]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background" aria-hidden>
      <div className="hero-image-layer absolute inset-0 opacity-80">
        <HeroImage imageRef={imageRef} priority hidden={live} />
        {enhance ? <HeroDepthField onLive={markLive} onFallback={markFallback} /> : null}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-16 bg-gradient-to-b from-background/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[40%] bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  );
}
