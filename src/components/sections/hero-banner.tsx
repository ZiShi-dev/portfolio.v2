"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type HeroBannerProps = {
  className?: string;
  /**
   * `panel` — carte latérale.
   * `concave` — fond hero plein écran.
   */
  variant?: "panel" | "concave";
};

const sunriseEase = [0.22, 1, 0.36, 1] as const;
/** Opacité finale de la bannière (texte / CTA restent lisibles). */
const BANNER_OPACITY = 0.45;
const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

/** Variantes responsives — WebP d’abord, JPEG en secours (mauvais Wi‑Fi). */
const HERO_SOURCES = {
  webp: [
    { src: "/images/hero-banner-atlas-1280.webp", width: 1280 },
    { src: "/images/hero-banner-atlas-1920.webp", width: 1920 },
  ],
  jpeg: [
    { src: "/images/hero-banner-atlas-1280.jpg", width: 1280 },
    { src: "/images/hero-banner-atlas-1920.jpg", width: 1920 },
    { src: brand.heroBanner, width: 1920 },
  ],
} as const;

/**
 * Bannière en `<picture>` natif (pas via /_next/image) :
 * - sert WebP/JPEG déjà optimisés
 * - évite de télécharger le plein HD sur mobile
 */
function HeroImage({
  className,
  alt = "",
  priority,
}: {
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  const webpSrcSet = HERO_SOURCES.webp
    .map((item) => `${item.src} ${item.width}w`)
    .join(", ");
  const jpegSrcSet = HERO_SOURCES.jpeg
    .map((item) => `${item.src} ${item.width}w`)
    .join(", ");

  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes="100vw" />
      <source type="image/jpeg" srcSet={jpegSrcSet} sizes="100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element -- asset local HD, éviter l’optimiseur Next */}
      <img
        src={brand.heroBanner}
        alt={alt}
        width={1920}
        height={1080}
        sizes="100vw"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        className={className}
      />
    </picture>
  );
}

function HeroBackdrop({
  className,
  sunrise,
}: {
  className?: string;
  sunrise: boolean;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-background",
        className
      )}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        initial={sunrise ? { opacity: 0 } : false}
        animate={{ opacity: BANNER_OPACITY }}
        transition={
          sunrise
            ? { duration: 1.8, delay: 0.1, ease: sunriseEase }
            : { duration: 0 }
        }
      >
        <HeroImage
          priority
          className="h-full w-full object-cover object-center"
        />
      </motion.div>

      {sunrise ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] bg-background"
          initial={{ opacity: 0.92 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.4, delay: 0.2, ease: sunriseEase }}
          aria-hidden
        />
      ) : null}

      {sunrise ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[50%] origin-bottom"
          style={{
            background:
              "linear-gradient(to top, rgba(201,169,106,0.22) 0%, rgba(201,169,106,0.06) 45%, transparent 100%)",
          }}
          initial={{ opacity: 0, scaleY: 0.4 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 2.2, delay: 0.35, ease: sunriseEase }}
          aria-hidden
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[40%] bg-gradient-to-t from-[rgba(201,169,106,0.12)] to-transparent"
          aria-hidden
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-24 bg-gradient-to-b from-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
}

function ConcaveBanner({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

  const sunrise = Boolean(mounted && !reduceMotion);

  return <HeroBackdrop className={className} sunrise={sunrise} />;
}

export function HeroBanner({
  className,
  variant = "panel",
}: HeroBannerProps) {
  if (variant === "concave") {
    return <ConcaveBanner className={className} />;
  }

  return (
    <figure
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border-gold bg-surface-elevated shadow-[0_0_40px_-12px_rgba(201,169,106,0.18)]",
        className
      )}
    >
      <HeroImage
        alt={brand.heroBannerAlt}
        priority
        className="h-auto w-full object-cover"
      />
    </figure>
  );
}
