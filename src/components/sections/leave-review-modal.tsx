"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewFormPage } from "@/components/sections/review-form-page";
import { lockBodyScroll } from "@/lib/lock-body-scroll";
import {
  CLOSE_LEAVE_REVIEW_EVENT,
  OPEN_LEAVE_REVIEW_EVENT,
  OPEN_REVIEW_QUERY,
} from "@/lib/open-leave-review-modal";
import { useModalA11y } from "@/hooks/use-modal-a11y";
import { REVIEW_MODAL_TITLE_ID } from "@/lib/modal-a11y-ids";

const MODAL_EASE = [0.22, 1, 0.36, 1] as const;

type LeaveReviewModalProps = {
  showCallout?: boolean;
};

function clearOpenReviewQuery() {
  const params = new URLSearchParams(window.location.search);
  if (params.get(OPEN_REVIEW_QUERY) !== "1") return;

  params.delete(OPEN_REVIEW_QUERY);
  const qs = params.toString();
  window.history.replaceState(
    null,
    "",
    window.location.pathname + (qs ? `?${qs}` : "")
  );
}

export function LeaveReviewModal({ showCallout = true }: LeaveReviewModalProps) {
  const tReview = useTranslations("reviewForm");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const [projectId, setProjectId] = useState<string | null>(null);
  const unlockScrollRef = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalA11y(open, dialogRef);

  const closeModal = useCallback(() => {
    setOpen(false);
    // Débloque immédiatement (ne dépend pas de la fin d'animation Framer).
    unlockScrollRef.current?.();
    unlockScrollRef.current = null;
  }, []);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    document.addEventListener(OPEN_LEAVE_REVIEW_EVENT, handleOpen);
    document.addEventListener(CLOSE_LEAVE_REVIEW_EVENT, closeModal);

    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const project = params.get("project");
      if (project && /^[0-9a-f-]{36}$/i.test(project)) {
        setProjectId(project);
      }
      if (params.get(OPEN_REVIEW_QUERY) === "1") {
        setOpen(true);
        clearOpenReviewQuery();
      }

      if (window.location.hash === "#laisser-un-avis") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
        setOpen(true);
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener(OPEN_LEAVE_REVIEW_EVENT, handleOpen);
      document.removeEventListener(CLOSE_LEAVE_REVIEW_EVENT, closeModal);
    };
  }, [closeModal]);

  useEffect(() => {
    if (!open) return;

    unlockScrollRef.current = lockBodyScroll();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScrollRef.current?.();
      unlockScrollRef.current = null;
    };
  }, [open, closeModal]);

  return (
    <div className={showCallout ? "bg-background px-4 py-16 sm:px-6 lg:py-20" : "contents"}>
      {showCallout && (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
            {tReview("modalCalloutEyebrow")}
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {tReview("modalCalloutTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {tReview("modalCalloutBody")}
          </p>
          <Button size="lg" className="min-h-12" onClick={() => setOpen(true)}>
            {tReview("modalCalloutOpen")}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="scrollbar-overlay fixed inset-0 z-[999] overflow-y-auto overscroll-contain bg-background/72 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.2,
              ease: MODAL_EASE,
            }}
            onClick={closeModal}
            role="presentation"
          >
            <div className="flex min-h-full items-center justify-center">
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={REVIEW_MODAL_TITLE_ID}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.985,
                        y: 8,
                        transition: { duration: 0.18, ease: MODAL_EASE },
                      }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.26,
                  ease: MODAL_EASE,
                }}
                className="relative my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border-gold/30 bg-surface-elevated/96 shadow-[0_24px_64px_-44px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  data-modal-initial-focus
                  className="absolute right-2.5 top-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:border-border-gold/35 hover:bg-primary/5 hover:text-foreground sm:right-3 sm:top-3"
                  aria-label={tCommon("closeModal")}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>

                <div className="p-3 sm:p-5">
                  <ReviewFormPage
                    variant="modal"
                    projectId={projectId}
                    onClose={closeModal}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
