import { SkeletonPulse } from "@/components/skeletons/vorzix-skeleton";
import { cn } from "@/lib/utils";

export function AdminLoginSkeleton() {
  return (
    <div
      className="w-full max-w-md space-y-6"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Loading</span>
      <div className="space-y-2 text-center">
        <SkeletonPulse className="mx-auto h-12 w-12 rounded-full" />
        <SkeletonPulse className="mx-auto h-6 w-48 max-w-full" />
        <SkeletonPulse className="mx-auto h-3 w-64 max-w-full" />
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-6">
        {[0, 1].map((i) => (
          <SkeletonPulse key={i} className="h-12 w-full rounded-xl" />
        ))}
        <SkeletonPulse className="h-11 w-full rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="w-full max-w-5xl space-y-10" aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading</span>
      <div className="space-y-3">
        <SkeletonPulse className="h-9 w-56 max-w-full sm:h-10" />
        <SkeletonPulse className="h-4 w-full max-w-lg" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonPulse key={i} className="h-20 rounded-2xl border border-border bg-card/40" />
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card/35 p-4 sm:p-5">
        <SkeletonPulse className="h-5 w-40" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonPulse key={i} className={cn("h-10 w-full rounded-lg", i % 2 === 1 && "opacity-90")} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminPreviewServiceSkeleton() {
  return (
    <div
      className="grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Loading</span>
      <div className="space-y-4">
        <SkeletonPulse className="h-6 w-48" />
        <SkeletonPulse className="h-3 w-full max-w-md" />
        <div className="space-y-2 pt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonPulse key={i} className="h-3 w-full rounded" />
          ))}
        </div>
      </div>
      <SkeletonPulse className="min-h-[22rem] rounded-2xl border border-border bg-card/40 lg:min-h-[28rem]" />
    </div>
  );
}

export function AdminListPageSkeleton({ dense }: { dense?: boolean }) {
  return (
    <div className="w-full max-w-5xl space-y-6" aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <SkeletonPulse className="h-8 w-48" />
          <SkeletonPulse className="h-3 w-72 max-w-full" />
        </div>
        <SkeletonPulse className="h-10 w-32 rounded-[var(--radius-md)]" />
      </div>
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <div className="mb-4 flex gap-2">
          <SkeletonPulse className="h-9 flex-1 rounded-lg sm:max-w-xs" />
          <SkeletonPulse className="h-9 w-24 rounded-lg" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: dense ? 12 : 8 }, (_, i) => (
            <SkeletonPulse
              key={i}
              className={cn("h-12 w-full rounded-lg", dense && "h-10")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
