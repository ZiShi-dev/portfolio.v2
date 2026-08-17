import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FolderKanban,
  Inbox,
  MessageSquareQuote,
  PackageOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StatusTone = "live" | "attention" | "info" | "danger" | "muted";

export type OverviewTodoItem = {
  label: string;
  href: string;
  tone: "urgent" | "attention" | "neutral";
};

export type HistogramBar = {
  label: string;
  value: number;
  tone: StatusTone;
};

export type HistogramChart = {
  title: string;
  summary: string;
  href: string;
  kind: "offers" | "projects" | "reviews" | "inquiries";
  bars: HistogramBar[];
};

type AdminDashboardOverviewProps = {
  title: string;
  body: string;
  todoTitle: string;
  todoItems: OverviewTodoItem[];
  todoNone: string;
  totalLabel: string;
  charts: HistogramChart[];
};

const chartIcons = {
  offers: PackageOpen,
  projects: FolderKanban,
  reviews: MessageSquareQuote,
  inquiries: Inbox,
} as const;

const segmentToneClasses: Record<StatusTone, string> = {
  live: "bg-emerald-400/80",
  attention: "bg-amber-400/80",
  info: "bg-sky-400/75",
  danger: "bg-red-400/70",
  muted: "bg-foreground/18",
};

const dotToneClasses: Record<StatusTone, string> = {
  live: "bg-emerald-400",
  attention: "bg-amber-400",
  info: "bg-sky-400",
  danger: "bg-red-400",
  muted: "bg-foreground/30",
};

export function AdminDashboardOverview({
  title,
  body,
  todoTitle,
  todoItems,
  todoNone,
  totalLabel,
  charts,
}: AdminDashboardOverviewProps) {
  return (
    <section aria-labelledby="admin-overview-title" className="space-y-8">
      <header className="max-w-2xl">
        <h2
          id="admin-overview-title"
          className="font-display text-2xl font-semibold tracking-tight"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </header>

      <section aria-labelledby="admin-todo-title" className="space-y-3">
        <div className="flex items-center gap-2">
          <CircleAlert className="h-4 w-4 text-primary" aria-hidden />
          <h3
            id="admin-todo-title"
            className="text-sm font-semibold text-foreground/78"
          >
            {todoTitle}
          </h3>
        </div>

        {todoItems.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {todoItems.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex min-h-16 items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3 text-sm font-medium outline-none transition-all",
                    "hover:-translate-y-0.5 hover:bg-card focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    item.tone === "urgent"
                      ? "border-red-400/22 hover:border-red-400/38"
                      : item.tone === "attention"
                        ? "border-amber-400/22 hover:border-amber-400/38"
                        : "border-border/80 hover:border-primary/28"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      item.tone === "urgent"
                        ? "bg-red-400"
                        : item.tone === "attention"
                          ? "bg-amber-400"
                          : "bg-primary"
                    )}
                  />
                  <span className="min-w-0 flex-1 leading-snug text-foreground/82">
                    {item.label}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-hover:translate-x-0.5 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-emerald-400/18 bg-emerald-400/[0.04] px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
            <p className="text-sm text-muted-foreground">{todoNone}</p>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {charts.map((chart, index) => (
          <StatusDistribution
            key={chart.title}
            {...chart}
            totalLabel={totalLabel}
            titleId={`admin-overview-chart-${index}`}
          />
        ))}
      </div>
    </section>
  );
}

function StatusDistribution({
  title,
  summary,
  href,
  kind,
  bars,
  totalLabel,
  titleId,
}: HistogramChart & { totalLabel: string; titleId: string }) {
  const total = bars.reduce((sum, bar) => sum + bar.value, 0);
  const safeTotal = Math.max(total, 1);
  const Icon = chartIcons[kind];

  return (
    <article
      aria-labelledby={titleId}
      className="group min-w-0 rounded-2xl border border-border/80 bg-card/58 p-5 transition-colors hover:border-primary/25 hover:bg-card/78 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/18 bg-primary/8 text-primary">
            <Icon className="h-4.5 w-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 id={titleId} className="font-display text-lg font-semibold">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {summary}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-end">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground rtl:normal-case rtl:tracking-normal">
            {totalLabel}
          </p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">
            {total}
          </p>
        </div>
      </div>

      <div
        role="img"
        aria-label={summary}
        className="mt-6 flex h-3 overflow-hidden rounded-full bg-foreground/[0.055] ring-1 ring-inset ring-foreground/[0.04]"
      >
        {total > 0
          ? bars.map((bar) => (
              <span
                key={bar.label}
                aria-hidden
                className={cn(
                  "h-full border-e border-background/45 last:border-e-0",
                  segmentToneClasses[bar.tone]
                )}
                style={{
                  width: `${(bar.value / safeTotal) * 100}%`,
                  minWidth: bar.value > 0 ? "3px" : undefined,
                }}
              />
            ))
          : null}
      </div>

      <ul className="mt-5 grid gap-x-5 gap-y-3 sm:grid-cols-2">
        {bars.map((bar) => {
          const percentage = total === 0 ? 0 : Math.round((bar.value / total) * 100);
          return (
            <li key={bar.label} className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className={cn("h-2 w-2 shrink-0 rounded-full", dotToneClasses[bar.tone])}
              />
              <span className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
                {bar.label}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-foreground/90">
                {bar.value}
                <span className="ms-1 text-muted-foreground" dir="ltr">
                  {percentage}%
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <Link
        href={href}
        className="mt-5 inline-flex min-h-9 items-center gap-2 rounded-lg text-xs font-medium text-primary outline-none transition-colors hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-primary/45"
      >
        {title}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          aria-hidden
        />
      </Link>
    </article>
  );
}
