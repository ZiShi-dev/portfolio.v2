import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  className,
  id,
  as: HeadingTag = "h2",
}: {
  title: React.ReactNode;
  subtitle?: ReactNode;
  className?: string;
  id?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl text-start", className)}>
      <HeadingTag
        id={id}
        className="text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl"
      >
        {title}
      </HeadingTag>
      {subtitle ? (
        <p className="mt-4 max-w-[52ch] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
