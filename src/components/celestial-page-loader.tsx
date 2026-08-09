"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function LoaderMark({ compact }: { compact?: boolean }) {
  const t = useTranslations("common");

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[#070A12]",
        compact ? "min-h-[40vh] w-full" : "h-full w-full"
      )}
      aria-busy="true"
      aria-live="polite"
      aria-label={t("loading")}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[#F4F1E8]/15 border-t-[#C9A96A]"
          aria-hidden
        />
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
    const minMs = reduced ? 200 : 900;
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
        goneTimer = window.setTimeout(() => setPhase("gone"), 400);
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
