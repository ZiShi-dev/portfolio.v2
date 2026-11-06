"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  id?: string;
};

export function StarRating({ value, onChange, error, id = "review-rating" }: StarRatingProps) {
  const t = useTranslations("reviewForm");

  return (
    <div
      className={cn(
        "w-full rounded-2xl border px-4 py-4 transition-[border-color,box-shadow] duration-200 sm:px-5 sm:py-5",
        error
          ? "border-destructive/80 bg-destructive/5"
          : value > 0
            ? "border-border-gold/35 bg-surface-elevated/55 shadow-[inset_0_1px_0_rgba(244,241,232,0.04)]"
            : "border-border/70 bg-surface/45"
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p id={`${id}-label`} className="text-sm font-medium text-foreground/85">
          {t("rating")} <span className="text-primary">*</span>
        </p>
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.14em]",
            value > 0 ? "text-primary/75" : "text-muted-foreground/55"
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {value > 0 ? t("magnitude", { value }) : t("magnitudeEmpty")}
        </span>
      </div>
      <div
        id={id}
        tabIndex={-1}
        className="mt-3 flex flex-wrap gap-1.5 outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50 sm:gap-2"
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <StarRatingButton
            key={star}
            selected={value >= star}
            checked={value === star}
            onSelect={() => onChange(star)}
            ariaLabel={t("starAria", { count: star })}
          />
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function StarRatingButton({
  selected,
  checked,
  onSelect,
  ariaLabel,
}: {
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      aria-label={ariaLabel}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl border transition-[border-color,background-color,color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 motion-reduce:transform-none",
        selected
          ? "border-primary/45 bg-primary/[0.09] text-primary shadow-[0_0_0_1px_rgba(201,169,106,0.1)]"
          : "border-border/55 bg-background/30 text-muted-foreground/75 hover:border-border-gold/30 hover:bg-surface-elevated/40"
      )}
    >
      <Star
        className={cn(
          "h-6 w-6 transition-colors sm:h-7 sm:w-7",
          selected
            ? "fill-primary stroke-primary"
            : "fill-none stroke-muted-foreground/50 stroke-[1.25]"
        )}
        strokeWidth={selected ? 0 : 1.25}
      />
    </button>
  );
}
