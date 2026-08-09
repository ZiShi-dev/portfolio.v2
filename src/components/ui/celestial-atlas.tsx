"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type CelestialAtlasProps = {
  className?: string;
  /** Intensité visuelle : hero plus présent, sections plus discrètes */
  intensity?: "subtle" | "hero";
};

/**
 * Décor Atlas Céleste : arcs d'astrolabe, constellation, coordonnées, étoiles.
 * Décoratif uniquement — opacité basse, masqué en grande partie sur mobile.
 */
export function CelestialAtlas({
  className,
  intensity = "subtle",
}: CelestialAtlasProps) {
  const reduceMotion = useReducedMotion();
  const isHero = intensity === "hero";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      {/* Halos laiton extrêmement subtils */}
      <div
        className={cn(
          "absolute rounded-full bg-primary/10 blur-3xl",
          isHero
            ? "-right-24 top-1/4 h-72 w-72 opacity-40 sm:opacity-50"
            : "right-0 top-0 h-56 w-56 opacity-30"
        )}
      />
      <div
        className={cn(
          "absolute rounded-full bg-primary/[0.06] blur-3xl",
          isHero
            ? "-left-20 bottom-1/4 h-64 w-64 opacity-50"
            : "bottom-0 left-1/4 h-40 w-40 opacity-40"
        )}
      />

      {/* Grille / arcs SVG */}
      <svg
        className={cn(
          "absolute inset-0 h-full w-full text-primary",
          isHero ? "opacity-[0.12] sm:opacity-[0.14]" : "opacity-[0.08] sm:opacity-[0.11]"
        )}
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Cercles d'astrolabe */}
        <circle
          cx="900"
          cy="220"
          r="180"
          stroke="currentColor"
          strokeWidth="0.75"
          className={cn(!reduceMotion && isHero && "celestial-draw")}
          style={
            !reduceMotion && isHero
              ? { strokeDasharray: 1130, strokeDashoffset: 0 }
              : undefined
          }
        />
        <circle
          cx="900"
          cy="220"
          r="120"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.7"
        />
        <circle
          cx="900"
          cy="220"
          r="60"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Grand arc bas-gauche */}
        <path
          d="M80 720 C 200 480, 420 380, 620 420"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.55"
        />
        <path
          d="M120 760 C 280 520, 480 400, 700 460"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.35"
        />

        {/* Constellation (lignes + étoiles) — Orion-like simplifié */}
        <g opacity="0.9">
          <line x1="280" y1="180" x2="340" y2="240" stroke="currentColor" strokeWidth="0.6" />
          <line x1="340" y1="240" x2="320" y2="320" stroke="currentColor" strokeWidth="0.6" />
          <line x1="320" y1="320" x2="380" y2="360" stroke="currentColor" strokeWidth="0.6" />
          <line x1="340" y1="240" x2="420" y2="200" stroke="currentColor" strokeWidth="0.6" />
          <line x1="420" y1="200" x2="460" y2="260" stroke="currentColor" strokeWidth="0.6" />

          <circle cx="280" cy="180" r="2.2" fill="currentColor" className={!reduceMotion ? "animate-twinkle" : undefined} />
          <circle cx="340" cy="240" r="1.6" fill="currentColor" opacity="0.8" />
          <circle cx="320" cy="320" r="2" fill="currentColor" className={!reduceMotion ? "animate-twinkle" : undefined} style={{ animationDelay: "1.2s" }} />
          <circle cx="380" cy="360" r="1.4" fill="currentColor" opacity="0.7" />
          <circle cx="420" cy="200" r="2.4" fill="currentColor" className={!reduceMotion ? "animate-twinkle" : undefined} style={{ animationDelay: "2.4s" }} />
          <circle cx="460" cy="260" r="1.5" fill="currentColor" opacity="0.75" />
        </g>

        {/* Étoiles éparses */}
        <g fill="currentColor">
          <circle cx="140" cy="120" r="1.2" opacity="0.5" />
          <circle cx="680" cy="90" r="1" opacity="0.4" />
          <circle cx="1050" cy="480" r="1.3" opacity="0.45" />
          <circle cx="980" cy="620" r="1" opacity="0.35" />
          <circle cx="200" cy="500" r="1.1" opacity="0.4" />
          <circle cx="760" cy="540" r="1.2" opacity="0.4" className={!reduceMotion ? "animate-twinkle" : undefined} style={{ animationDelay: "3.5s" }} />
        </g>

        {/* Croix de viseur / repère */}
        <g opacity="0.45" stroke="currentColor" strokeWidth="0.6">
          <line x1="900" y1="200" x2="900" y2="240" />
          <line x1="880" y1="220" x2="920" y2="220" />
        </g>
      </svg>

      {/* Micro-labels coordonnées — desktop uniquement */}
      <div
        className={cn(
          "absolute hidden font-mono uppercase tracking-[0.22em] text-primary sm:block",
          isHero ? "text-[9px] opacity-40" : "text-[8px] opacity-30"
        )}
      >
        <span className="absolute left-[6%] top-[18%]">RA 05h 55m</span>
        <span className="absolute right-[8%] top-[28%]">DEC +07° 24′</span>
        <span className="absolute bottom-[22%] left-[10%]">CAT. VZ—ATLAS</span>
        {isHero ? (
          <span className="absolute right-[12%] bottom-[18%]">EPOCH J2000.0</span>
        ) : null}
      </div>

      {/* Fond vault existant en complément très léger */}
      <div className="absolute inset-0 celestial-vault opacity-50" />
    </div>
  );
}
