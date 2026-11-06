import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { pageShellClass, pageTopClass } from "@/components/page-back-link";

/** Bloc de chargement — palette Nuit Céleste, discret (charte VORZIX). */
export function SkeletonPulse({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block rounded-md bg-foreground/[0.06] motion-safe:animate-pulse",
        className
      )}
      aria-hidden
    />
  );
}

export function SkeletonEyebrow({ className }: { className?: string }) {
  return (
    <SkeletonPulse
      className={cn("h-3 w-28 rounded-full sm:w-32", className)}
    />
  );
}

export function SkeletonLine({
  className,
  wide = false,
}: {
  className?: string;
  wide?: boolean;
}) {
  return (
    <SkeletonPulse
      className={cn(
        "h-4 w-full",
        wide ? "max-w-2xl" : "max-w-md",
        className
      )}
    />
  );
}

export function SkeletonTitle({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <SkeletonPulse className="h-9 w-full max-w-lg sm:h-11" />
      <SkeletonPulse className="h-9 w-4/5 max-w-md sm:h-11" />
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card/50",
        className
      )}
    >
      <SkeletonPulse className="h-40 w-full rounded-none sm:h-44" />
      <div className="space-y-3 p-4 sm:p-6">
        <SkeletonPulse className="h-3 w-20" />
        <SkeletonPulse className="h-6 w-4/5 max-w-xs" />
        <SkeletonPulse className="h-3.5 w-full" />
        <SkeletonPulse className="h-3.5 w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(pageShellClass, pageTopClass, "pb-24", className)}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Loading</span>
      {children}
    </div>
  );
}

export function SkeletonBackBar() {
  return (
    <div className={cn(pageShellClass, pageTopClass)}>
      <SkeletonPulse className="h-4 w-36 rounded" />
    </div>
  );
}
