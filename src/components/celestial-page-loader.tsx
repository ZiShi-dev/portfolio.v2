"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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

function LoaderMark() {
  const t = useTranslations("common");
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background" aria-busy="true" aria-label={t("loading")}>
      <div className="pointer-events-none absolute inset-0 celestial-vault opacity-50" aria-hidden />
      <AstrolabeMark size={64} />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}

/** Overlay plein écran au premier chargement / rechargement. */
export function CelestialPageSplash() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let checking = false;
    let frame = 0;
    let goneTimer = 0;

    const isReady = () => {
      if (document.readyState === "loading" || document.querySelector("[data-route-loading]") || document.fonts.status === "loading") return false;
      return Array.from(document.images).every((image) => {
        const rect = image.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
        return !visible || image.complete;
      });
    };

    const checkReady = () => {
      if (cancelled || checking || !isReady()) return;
      checking = true;
      // Give the committed page two paint frames before revealing it.
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
          if (cancelled) return;
          if (!isReady()) { checking = false; return; }
          setPhase("fade");
          goneTimer = window.setTimeout(() => setPhase("gone"), reduced ? 0 : 180);
        });
      });
    };

    const observer = new MutationObserver(checkReady);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("load", checkReady);
    document.addEventListener("DOMContentLoaded", checkReady);
    document.addEventListener("load", checkReady, true);
    document.addEventListener("error", checkReady, true);
    void document.fonts.ready.then(checkReady);
    checkReady();

    return () => {
      cancelled = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.clearTimeout(goneTimer);
      window.removeEventListener("load", checkReady);
      document.removeEventListener("DOMContentLoaded", checkReady);
      document.removeEventListener("load", checkReady, true);
      document.removeEventListener("error", checkReady, true);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] transition-opacity duration-[180ms] ease-out motion-reduce:transition-none",
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
    <div data-route-loading="true" className="fixed inset-0 z-[100] bg-background">
      <LoaderMark />
    </div>
  );
}
