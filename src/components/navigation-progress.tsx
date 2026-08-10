"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_CHANGE_EVENT } from "@/lib/locale-cookie";
import {
  isInternalNavigationAnchor,
  NAVIGATION_START_EVENT,
} from "@/lib/navigation-progress";

function clearTimers(timers: number[]) {
  timers.forEach(clearTimeout);
  timers.length = 0;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const prevPath = useRef(pathname);
  const timersRef = useRef<number[]>([]);
  const activeRef = useRef(false);

  const finishProgress = useCallback(() => {
    clearTimers(timersRef.current);
    setVisible(true);
    setWidth(100);
    timersRef.current.push(
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
        activeRef.current = false;
      }, 280)
    );
  }, []);

  /** Démarre et reste en attente (~82 %) jusqu’à finishProgress. */
  const startProgress = useCallback(() => {
    clearTimers(timersRef.current);
    activeRef.current = true;
    setVisible(true);
    setWidth(10);
    timersRef.current.push(window.setTimeout(() => setWidth(38), 40));
    timersRef.current.push(window.setTimeout(() => setWidth(62), 120));
    timersRef.current.push(window.setTimeout(() => setWidth(78), 280));
    timersRef.current.push(window.setTimeout(() => setWidth(82), 520));
    // Sécurité : ne jamais bloquer la barre indéfiniment
    timersRef.current.push(window.setTimeout(() => finishProgress(), 8_000));
  }, [finishProgress]);

  /** Animation complète (changement de langue, navigation déjà résolue). */
  const pulseProgress = useCallback(() => {
    clearTimers(timersRef.current);
    activeRef.current = true;
    setVisible(true);
    setWidth(12);
    timersRef.current.push(window.setTimeout(() => setWidth(55), 50));
    timersRef.current.push(window.setTimeout(() => setWidth(82), 160));
    timersRef.current.push(window.setTimeout(() => finishProgress(), 320));
  }, [finishProgress]);

  useEffect(() => {
    const onNavStart = () => startProgress();
    const onLocale = () => pulseProgress();
    window.addEventListener(NAVIGATION_START_EVENT, onNavStart);
    window.addEventListener(LOCALE_CHANGE_EVENT, onLocale);
    return () => {
      window.removeEventListener(NAVIGATION_START_EVENT, onNavStart);
      window.removeEventListener(LOCALE_CHANGE_EVENT, onLocale);
    };
  }, [startProgress, pulseProgress]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigationAnchor(anchor, event)) return;
      startProgress();
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [startProgress]);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    if (activeRef.current) {
      finishProgress();
    } else {
      pulseProgress();
    }
  }, [pathname, finishProgress, pulseProgress]);

  useEffect(() => {
    return () => clearTimers(timersRef.current);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] bg-border/30"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      aria-hidden
    >
      <div
        className="relative h-full bg-primary transition-[width] duration-200 ease-out"
        style={{
          width: `${width}%`,
          boxShadow:
            "0 0 12px rgba(201,169,106,0.45), 0 0 4px rgba(229,201,143,0.35)",
        }}
      />
    </div>
  );
}
