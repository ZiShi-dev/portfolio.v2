import {
  SkeletonBackBar,
  SkeletonCard,
  SkeletonEyebrow,
  SkeletonLine,
  SkeletonPageShell,
  SkeletonPulse,
  SkeletonTitle,
} from "@/components/skeletons/vorzix-skeleton";
import { pageShellClass } from "@/components/page-back-link";
import { getHomeGridClass } from "@/lib/home-layout";
import { cn } from "@/lib/utils";

export function HomeSkeleton() {
  return (
    <div className="relative" aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading</span>
      {/* Aligné sur `HomeSection` + blocs suivants (contenu centré `max-w-3xl` / `max-w-6xl`). */}
      <section className="relative flex w-full max-w-[100vw] flex-col overflow-x-clip bg-background">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-4 pb-10 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
          <div className="relative z-10 mx-auto mt-[min(28vw,11rem)] flex w-full max-w-3xl flex-col items-center text-center sm:mt-[min(22vw,13rem)]">
            <div className="w-full space-y-6">
              <SkeletonEyebrow className="mx-auto" />
              <div className="space-y-3">
                <SkeletonPulse className="mx-auto h-9 w-full max-w-lg sm:h-11" />
                <SkeletonPulse className="mx-auto h-9 w-4/5 max-w-md sm:h-11" />
              </div>
              <div className="space-y-2">
                <SkeletonLine className="mx-auto h-4 max-w-xl" />
                <SkeletonLine className="mx-auto h-4 max-w-lg" />
              </div>
              <div className="flex w-full max-w-md flex-col gap-2.5 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
                <SkeletonPulse className="mx-auto h-12 w-full max-w-[min(100%,20rem)] rounded-[var(--radius-md)] sm:mx-0 sm:w-auto sm:min-w-[9rem]" />
                <SkeletonPulse className="mx-auto h-12 w-full max-w-[min(100%,18rem)] rounded-[var(--radius-md)] sm:mx-0 sm:w-auto sm:min-w-[8rem]" />
              </div>
              <SkeletonPulse className="mx-auto h-3 w-64 max-w-full rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <SkeletonCard key={i} className="border-primary/25" />
          ))}
        </div>
      </section>

      <section className="relative scroll-mt-28 overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <SkeletonEyebrow className="mx-auto" />
            <SkeletonTitle className="mt-4" />
            <SkeletonLine className="mx-auto mt-4 max-w-2xl" wide />
          </div>
          <div className="my-10 h-px w-full bg-border/50 sm:my-12" aria-hidden />
          <div
            className={cn(
              "mx-auto mt-10 grid max-w-6xl gap-3 sm:mt-12 sm:gap-5 lg:mt-14",
              getHomeGridClass(3)
            )}
          >
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative scroll-mt-28 overflow-x-clip bg-background py-16 sm:py-24 lg:py-28">
        <div className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SkeletonEyebrow className="mx-auto" />
            <SkeletonTitle className="mt-4" />
            <SkeletonLine className="mx-auto mt-4" wide />
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-10 sm:px-6">
          <SkeletonPulse className="aspect-[21/9] w-full rounded-2xl border border-border bg-card/35 sm:aspect-[2.4/1]" />
        </div>
      </section>
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
    <section className="relative overflow-x-clip bg-background pb-20 sm:pb-24 lg:pb-28">
      <SkeletonBackBar />
      <SkeletonPageShell className="pb-20 sm:pb-24 lg:pb-28">
        <div className="mt-8 max-w-none text-center sm:mt-10">
          <SkeletonEyebrow className="mx-auto" />
          <div className="mt-5">
            <SkeletonTitle />
          </div>
          <SkeletonLine className="mx-auto mt-5 h-4 max-w-2xl" wide />
        </div>
        <details className="mt-8 rounded-2xl border border-border bg-surface/40 sm:mt-10" open>
          <summary className="pointer-events-none flex min-h-14 list-none items-center gap-3 rounded-2xl px-4 py-3 sm:px-5">
            <SkeletonPulse className="h-4 w-4 shrink-0 rounded" />
            <SkeletonPulse className="h-4 w-28 rounded sm:w-36" />
          </summary>
          <div className="grid grid-cols-1 gap-4 border-t border-border p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <SkeletonPulse className="h-12 w-full rounded-xl" />
            <SkeletonPulse className="h-12 w-full rounded-xl" />
            <SkeletonPulse className="h-12 w-full rounded-xl" />
            <SkeletonPulse className="h-12 w-full rounded-xl" />
          </div>
        </details>
        <div className="mt-3 flex min-h-11 justify-between gap-3 px-1">
          <SkeletonPulse className="h-3 w-24 rounded-full sm:w-32" />
          <SkeletonPulse className="h-3 w-20 rounded-full sm:w-24" />
        </div>
        <div
          className={cn(
            "mt-6 grid grid-cols-1 gap-5 sm:mt-8",
            columns
          )}
        >
          {Array.from({ length: cards }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </SkeletonPageShell>
    </section>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <>
      <SkeletonBackBar />
      <div
        className="relative overflow-hidden bg-background pb-20 pt-28 sm:pb-28 sm:pt-32"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <span className="sr-only">Loading</span>
        <div className={cn(pageShellClass, "relative z-10 max-w-4xl space-y-8")}>
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
    <div
      className="relative min-h-dvh overflow-hidden bg-background"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Loading</span>
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <SkeletonPulse className="h-3 w-40 rounded-full sm:w-48" />
        <div className="mt-8 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-4">
            <SkeletonEyebrow />
            <SkeletonTitle />
            <SkeletonLine className="h-5 w-32" />
          </div>
          <SkeletonPulse className="h-12 w-12 shrink-0 rounded-md border border-border sm:h-14 sm:w-14" />
        </div>
        <div className="mt-5 space-y-2">
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-full max-w-[95%]" />
        </div>
        <div className="my-10 h-px w-full bg-border/60" aria-hidden />
        <div className="space-y-3">
          <SkeletonPulse className="h-6 w-48 rounded" />
          <SkeletonLine className="h-3.5 w-full" />
          <SkeletonLine className="h-3.5 w-full max-w-[92%]" />
        </div>
        <SkeletonPulse className="mt-10 h-32 w-full rounded-xl border border-border bg-card/40" />
        <div className="mt-10 space-y-3">
          <SkeletonPulse className="h-5 w-40 rounded" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-2.5">
              <SkeletonPulse className="mt-0.5 h-4 w-4 shrink-0 rounded" />
              <SkeletonLine className="h-3.5 flex-1" wide />
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <SkeletonPulse className="h-12 w-full max-w-xs rounded-[var(--radius-md)]" />
          <SkeletonPulse className="h-12 w-full max-w-xs rounded-[var(--radius-md)] border border-border" />
        </div>
      </div>
    </div>
  );
}

export function ContactSkeleton() {
  return (
    <>
      <SkeletonBackBar />
      <section className="relative scroll-mt-28 overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div
          className="relative z-10 mx-auto max-w-3xl"
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          <span className="sr-only">Loading</span>
          <div className="overflow-hidden rounded-xl border border-border-gold bg-surface-elevated/90 p-5 text-center sm:p-8 md:p-12">
            <SkeletonEyebrow className="mx-auto" />
            <div className="mt-4">
              <SkeletonTitle />
            </div>
            <SkeletonLine className="mx-auto mt-4 max-w-lg" wide />
            <SkeletonPulse className="mx-auto mt-8 h-12 w-full max-w-sm rounded-[var(--radius-md)] sm:mt-10" />
            <SkeletonPulse className="mx-auto mt-6 h-3 w-56 max-w-full rounded-full" />
            <SkeletonPulse className="mx-auto mt-3 h-3 w-64 max-w-full rounded-full opacity-80" />
          </div>
        </div>
      </section>
    </>
  );
}

export function LegalSkeleton() {
  return (
    <>
      <SkeletonBackBar />
      <div className="px-4 pb-20 sm:px-6 sm:pb-24">
        <article
          className="relative z-10 mx-auto mt-8 max-w-3xl pb-8"
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          <span className="sr-only">Loading</span>
          <SkeletonTitle />
          <SkeletonLine className="mt-3 max-w-2xl" wide />
          <SkeletonPulse className="mt-2 h-3 w-28 rounded-full" />
          <div className="mt-8 space-y-5">
            {Array.from({ length: 4 }, (_, s) => (
              <div
                key={s}
                className="rounded-2xl border border-border/60 bg-card/35 p-5 sm:p-6"
              >
                <SkeletonPulse className="h-5 w-48 rounded sm:h-6 sm:w-56" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 4 }, (_, i) => (
                    <SkeletonLine
                      key={i}
                      className={cn(i % 2 === 0 ? "h-3.5" : "h-3")}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}
