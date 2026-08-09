import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <Reveal>
        <span className="inline-block rounded-full border border-border-gold bg-surface-elevated/60 px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary sm:text-[11px]">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2
          id={id}
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl"
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
