"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe2, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useFloatingAction } from "@/components/floating-actions-provider";

/** Always visible, independent of the navigation and the contact-data request. */
export function FloatingLanguageButton() {
  const [open, setOpen] = useFloatingAction("language");
  const reduceMotion = useReducedMotion();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const label = "Français / English / العربية";

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLButtonElement>('button[aria-current="true"]')?.focus({ preventScroll: true });
    });
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", escape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", escape);
    };
  }, [open, setOpen]);

  return <div ref={root} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.25rem)] end-[max(1rem,env(safe-area-inset-right))] z-[45] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+4.25rem)] sm:end-[max(1.5rem,env(safe-area-inset-right))]">
    <AnimatePresence initial={false}>
    {open && <motion.div ref={panel} id={id} role="dialog" aria-label={label}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-primary/25 bg-surface/95 p-2 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <LanguageSwitcher embedded onNavigate={(navigate) => {
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
        navigate();
      }} />
    </motion.div>}
    </AnimatePresence>
    <button ref={trigger} type="button" aria-label={label} title={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen((value) => !value)} className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-surface-elevated/95 text-primary shadow-[0_12px_36px_-12px_rgba(0,0,0,0.95),0_0_28px_-14px_rgba(201,169,106,0.75)] backdrop-blur-xl transition-[transform,border-color] duration-200 hover:scale-105 hover:border-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none">
      <span className="pointer-events-none absolute inset-[5px] rounded-full border border-primary/15" />
      <AnimatePresence initial={false} mode="wait">
        <motion.span key={open ? "close" : "language"}
          initial={reduceMotion ? false : { opacity: 0, rotate: -25, scale: 0.72 }} animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 25, scale: 0.72 }}
          transition={{ duration: reduceMotion ? 0 : 0.14 }} className="relative flex">
          {open ? <X className="h-6 w-6" strokeWidth={1.7} aria-hidden /> : <Globe2 className="h-6 w-6" strokeWidth={1.7} aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  </div>;
}
