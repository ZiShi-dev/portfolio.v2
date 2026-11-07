import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlowCard({
  children,
  className,
  /** Bordure laiton et léger soulèvement au survol souris. */
  interactive = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border bg-surface-elevated/90 p-5 sm:p-6",
        interactive
          ? "card-feedback border-border hover:border-border-gold"
          : "border-border-strong",
        className
      )}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
