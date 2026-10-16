"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlowCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const motionAllowed = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => { motionAllowed.current = preference.matches; };
    sync();
    preference.addEventListener("change", sync);
    return () => {
      preference.removeEventListener("change", sync);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

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
        if (e.pointerType !== "mouse" || !motionAllowed.current) return;
        updatePos(e.clientX, e.clientY);
      }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-surface-elevated/90 p-5 transition-[border-color,box-shadow] duration-300 hover:border-border-gold hover:shadow-[0_0_28px_-10px_rgba(201,169,106,0.22)] sm:p-6",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background: "radial-gradient(240px circle at var(--glow-x, 50%) var(--glow-y, 50%), color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
