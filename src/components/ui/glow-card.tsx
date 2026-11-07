"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlowCard({
  children,
  className,
  /** Par défaut, léger reflet doré au survol (souris). Désactiver pour un bloc type fiche catalogue, sans effet « carte flottante ». */
  interactive = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const motionAllowed = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) {
      motionAllowed.current = false;
      return;
    }
    const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => { motionAllowed.current = preference.matches; };
    sync();
    preference.addEventListener("change", sync);
    return () => {
      preference.removeEventListener("change", sync);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [interactive]);

  function updatePos(clientX: number, clientY: number) {
    pointer.current = { x: clientX, y: clientY };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--glow-x", `${pointer.current.x - rect.left}px`);
      node.style.setProperty("--glow-y", `${pointer.current.y - rect.top}px`);
    });
  }

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        if (!interactive || e.pointerType !== "mouse" || !motionAllowed.current) return;
        updatePos(e.clientX, e.clientY);
      }}
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-lg)] border bg-surface-elevated/90 p-5 sm:p-6",
        interactive
          ? "vz-card-lift border-border transition-[border-color,transform,box-shadow] duration-300 hover:border-border-gold hover:shadow-[0_0_28px_-10px_rgba(201,169,106,0.2)] motion-reduce:hover:transform-none"
          : "border-border-strong",
        className
      )}
    >
      {interactive ? (
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background: "radial-gradient(220px circle at var(--glow-x, 50%) var(--glow-y, 50%), color-mix(in srgb, var(--color-primary) 9%, transparent), transparent 72%)",
        }}
      />
      ) : null}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
