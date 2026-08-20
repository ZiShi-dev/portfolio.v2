import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  id,
  as: HeadingTag = "h2",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: ReactNode;
  className?: string;
  id?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <Reveal>
        <span className="inline-block rounded-full border border-border-gold bg-surface-elevated/60 px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary rtl:font-sans rtl:tracking-normal sm:text-[11px]">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <HeadingTag
          id={id}
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground rtl:tracking-normal sm:mt-5 sm:text-4xl md:text-5xl"
        >
          {title}
        </HeadingTag>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-relaxed">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
