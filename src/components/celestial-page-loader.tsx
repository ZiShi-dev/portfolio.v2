"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

function AstrolabeMark({ size = 56 }: { size?: number }) {
  return (
    <div
      className="relative text-primary"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Halo doux */}
      <div className="absolute inset-[-18%] rounded-full bg-primary/10 blur-md" />

      <svg
        viewBox="0 0 64 64"
        className="celestial-spin absolute inset-0 h-full w-full"
        fill="none"
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.35"
          strokeDasharray="4 6"
        />
        <circle
          cx="32"
          cy="32"
          r="22"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeOpacity="0.55"
        />
      </svg>

      <svg
        viewBox="0 0 64 64"
        className="celestial-spin-rev absolute inset-0 h-full w-full"
        fill="none"
      >
        <circle
          cx="32"
          cy="32"
          r="14"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="2 5"
        />
        {/* Tick marks */}
        <line x1="32" y1="4" x2="32" y2="10" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="32" y1="54" x2="32" y2="60" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45" />
        <line x1="4" y1="32" x2="10" y2="32" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45" />
        <line x1="54" y1="32" x2="60" y2="32" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45" />
      </svg>

      {/* Étoile centrale */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(201,169,106,0.55)] motion-safe:animate-twinkle" />
      </div>
    </div>
  );
}

function LoaderMark({ compact }: { compact?: boolean }) {
  const t = useTranslations("common");

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-[#070A12]",
        compact ? "min-h-[40vh] w-full" : "h-full w-full"
      )}
      aria-busy="true"
      aria-live="polite"
      aria-label={t("loading")}
    >
      <div
        className="pointer-events-none absolute inset-0 celestial-vault opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,106,0.07),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6">
        <AstrolabeMark size={compact ? 48 : 64} />

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-display text-lg tracking-[0.18em] text-foreground sm:text-xl">
            {brand.name}
          </p>
          <p className="font-technical text-[10px] text-muted-foreground">
            {t("loadingCatalog")}
          </p>
        </div>

        {/* Barre de progression hairline */}
        <div
          className="h-px w-28 overflow-hidden rounded-full bg-foreground/10 sm:w-36"
          aria-hidden
        >
          <div className="celestial-loader-bar h-full w-1/2 rounded-full bg-primary/70" />
        </div>

        <span className="sr-only">{t("loading")}</span>
      </div>
    </div>
  );
}

/** Overlay plein écran au premier chargement / rechargement. */
export function CelestialPageSplash() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minMs = reduced ? 200 : 950;
    const started = performance.now();
    let fadeTimer = 0;
    let goneTimer = 0;
    let safetyTimer = 0;
    let startedFade = false;

    const beginFade = () => {
      if (startedFade) return;
      startedFade = true;
      const wait = Math.max(0, minMs - (performance.now() - started));
      fadeTimer = window.setTimeout(() => {
        setPhase("fade");
        goneTimer = window.setTimeout(() => setPhase("gone"), 450);
      }, wait);
    };

    if (document.readyState === "complete") {
      beginFade();
    } else {
      window.addEventListener("load", beginFade, { once: true });
      safetyTimer = window.setTimeout(beginFade, minMs + 1000);
    }

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(goneTimer);
      window.clearTimeout(safetyTimer);
      window.removeEventListener("load", beginFade);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] transition-opacity duration-500 ease-out",
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      role="status"
    >
      <LoaderMark />
    </div>
  );
}

/** Pour `loading.tsx` (navigation / Suspense). */
export function CelestialRouteLoader() {
  return (
    <div className="fixed inset-0 z-40 bg-[#070A12] md:static md:inset-auto md:min-h-[40vh]">
      <LoaderMark compact />
    </div>
  );
}
