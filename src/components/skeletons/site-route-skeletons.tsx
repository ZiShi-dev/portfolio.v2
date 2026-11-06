import {
  SkeletonBackBar,
  SkeletonCard,
  SkeletonEyebrow,
  SkeletonLine,
  SkeletonPageShell,
  SkeletonPulse,
  SkeletonTitle,
} from "@/components/skeletons/vorzix-skeleton";
import { cn } from "@/lib/utils";

export function HomeSkeleton() {
  return (
    <div className="relative" aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading</span>
      <div className="border-b border-border/60">
        <div className="mx-auto max-w-[var(--container-vorzix-wide)] px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
            <div className="space-y-6">
              <SkeletonEyebrow />
              <SkeletonTitle />
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-full max-w-xl" />
                <SkeletonLine className="h-4 w-full max-w-lg" />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <SkeletonPulse className="h-11 w-36 rounded-[var(--radius-md)]" />
                <SkeletonPulse className="h-11 w-32 rounded-[var(--radius-md)]" />
              </div>
            </div>
            <SkeletonPulse className="aspect-[1024/409] w-full rounded-2xl border border-border bg-card/40 sm:min-h-[220px]" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[var(--container-vorzix-wide)] space-y-16 px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonPulse className="mx-auto h-32 max-w-3xl rounded-2xl border border-border bg-card/30" />
      </div>
    </div>
  );
}

export function PageWithBackSkeleton({
  cards = 3,
  columns = "sm:grid-cols-2 md:grid-cols-3",
}: {
  cards?: number;
  columns?: string;
}) {
  return (
    <>
      <SkeletonBackBar />
      <SkeletonPageShell>
        <div className="mx-auto max-w-3xl text-center">
          <SkeletonEyebrow className="mx-auto" />
          <div className="mt-5">
            <SkeletonTitle />
          </div>
          <SkeletonLine className="mx-auto mt-5 h-4 max-w-2xl" wide />
        </div>
        <div
          className={cn(
            "mt-10 grid grid-cols-1 gap-5 sm:mt-14",
            columns
          )}
        >
          {Array.from({ length: cards }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </SkeletonPageShell>
    </>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <>
      <SkeletonBackBar />
      <div
        className="relative overflow-hidden bg-background px-4 pb-28 pt-28 sm:px-6 sm:pb-28 sm:pt-32"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <span className="sr-only">Loading</span>
        <div className="relative z-10 mx-auto max-w-4xl space-y-8">
          <SkeletonEyebrow />
          <SkeletonTitle />
          <SkeletonLine className="h-5 w-48" />
          <div className="space-y-3">
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-full max-w-[92%]" />
            <SkeletonLine className="h-4 w-full max-w-[85%]" />
          </div>
          <SkeletonPulse className="aspect-video w-full rounded-2xl border border-border bg-card/40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonPulse className="h-28 rounded-xl border border-border bg-card/30" />
            <SkeletonPulse className="h-28 rounded-xl border border-border bg-card/30" />
          </div>
        </div>
      </div>
    </>
  );
}

export function ServiceDetailSkeleton() {
  return (
    <>
      <SkeletonBackBar />
      <SkeletonPageShell>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="space-y-6">
            <SkeletonEyebrow />
            <SkeletonTitle />
            <div className="space-y-2">
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-full max-w-[94%]" />
              <SkeletonLine className="h-4 w-full max-w-[88%]" />
            </div>
            <SkeletonPulse className="h-12 w-44 rounded-[var(--radius-md)]" />
          </div>
          <div className="space-y-4">
            <SkeletonPulse className="h-48 w-full rounded-2xl border border-border bg-card/40" />
            <SkeletonPulse className="h-32 w-full rounded-xl border border-border bg-muted/30" />
          </div>
        </div>
      </SkeletonPageShell>
    </>
  );
}

export function ContactSkeleton() {
  return (
    <SkeletonPageShell>
      <div className="mx-auto max-w-xl text-center">
        <SkeletonEyebrow className="mx-auto" />
        <div className="mt-5">
          <SkeletonTitle />
        </div>
        <SkeletonLine className="mx-auto mt-4 max-w-lg" />
      </div>
      <div className="mx-auto mt-10 max-w-xl space-y-4">
        {[0, 1, 2].map((i) => (
          <SkeletonPulse key={i} className="h-12 w-full rounded-xl border border-border bg-card/30" />
        ))}
        <SkeletonPulse className="h-36 w-full rounded-xl border border-border bg-card/30" />
        <SkeletonPulse className="mx-auto h-11 w-full max-w-xs rounded-[var(--radius-md)]" />
      </div>
    </SkeletonPageShell>
  );
}

export function LegalSkeleton() {
  return (
    <SkeletonPageShell>
      <SkeletonTitle />
      <div className="prose-none mt-8 max-w-3xl space-y-4">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonLine
            key={i}
            className={cn(i % 3 === 0 ? "h-4" : "h-3")}
          />
        ))}
      </div>
    </SkeletonPageShell>
  );
}
