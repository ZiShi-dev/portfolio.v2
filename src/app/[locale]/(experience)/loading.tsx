import { SkeletonPulse } from "@/components/skeletons/vorzix-skeleton";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-10 sm:px-6 sm:py-14"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Loading</span>
      <div className="mb-8 space-y-4 border-b border-border pb-8">
        <SkeletonPulse className="h-3 w-32 rounded-full" />
        <SkeletonPulse className="h-8 w-4/5 max-w-md" />
        <SkeletonPulse className="h-3.5 w-full max-w-lg" />
      </div>
      <div className="flex flex-1 flex-col gap-5">
        <SkeletonPulse className="h-12 w-full rounded-xl border border-border bg-card/35" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonPulse
              key={i}
              className={cn(
                "h-24 rounded-xl border border-border bg-card/30",
                i === 0 && "sm:col-span-2 h-28"
              )}
            />
          ))}
        </div>
        <div className="mt-auto flex gap-3 pt-6">
          <SkeletonPulse className="h-11 flex-1 rounded-[var(--radius-md)] sm:max-w-[10rem]" />
          <SkeletonPulse className="h-11 flex-1 rounded-[var(--radius-md)] sm:max-w-[10rem]" />
        </div>
      </div>
    </div>
  );
}
