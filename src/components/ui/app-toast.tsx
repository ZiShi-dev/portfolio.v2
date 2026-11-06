"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  clearAppToast,
  subscribeAppToast,
  type AppToast,
} from "@/lib/app-toast";
import { cn } from "@/lib/utils";

const AUTO_DISMISS_MS = 6200;
const TOAST_EASE = [0.22, 1, 0.36, 1] as const;
const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function AppToastHost() {
  const tCommon = useTranslations("common");
  const reduceMotion = useReducedMotion();
  const [toast, setToast] = useState<AppToast | null>(null);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

  useEffect(() => {
    return subscribeAppToast(setToast);
  }, []);

  useEffect(() => {
    if (!toast) return;

    let timer: number | null = null;
    const start = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => clearAppToast(), AUTO_DISMISS_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (timer !== null) window.clearTimeout(timer);
        timer = null;
      } else {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [toast]);

  if (!mounted) return null;

  const Icon =
    toast?.variant === "success"
      ? CheckCircle2
      : toast?.variant === "info"
        ? Info
        : AlertCircle;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1100] flex justify-center p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {toast ? (
          <motion.div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            aria-live={toast.variant === "error" ? "assertive" : "polite"}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: "120%", scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: 8,
                    scale: 0.985,
                    transition: { duration: 0.18, ease: TOAST_EASE },
                  }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.26,
              ease: TOAST_EASE,
            }}
            className={cn(
              "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_24px_70px_-28px_rgb(0_0_0/0.9)] backdrop-blur-xl",
              toast.variant === "success"
                ? "border-primary/35 bg-card/95 text-foreground"
                : toast.variant === "info"
                ? "border-accent/30 bg-card/95 text-foreground"
                : "border-destructive/40 bg-card/95 text-foreground"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                toast.variant === "success"
                  ? "text-primary"
                  : toast.variant === "info"
                    ? "text-accent"
                    : "text-danger"
              )}
              aria-hidden
            />
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground/90">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => clearAppToast()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/45 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/45"
              aria-label={tCommon("closeModal")}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body
  );
}
