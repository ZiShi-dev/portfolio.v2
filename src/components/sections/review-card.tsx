"use client";

import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatedStarRating } from "@/components/ui/animated-star-rating";
import { getReviewInitials, type ReviewItem } from "@/data/reviews";
import { cn } from "@/lib/utils";

type ReviewCardProps = {
  review: ReviewItem;
  className?: string;
  onOpen?: () => void;
  /** Variante mise en avant (section home). */
  featured?: boolean;
};

export function ReviewCard({
  review,
  className,
  onOpen,
  featured = false,
}: ReviewCardProps) {
  const t = useTranslations("reviews");
  const initials = getReviewInitials(review);

  return (
    <div className={cn("relative h-full", className)}>
      <article
        className={cn(
          "flex h-full flex-col rounded-xl border bg-surface-elevated/70 p-5 transition-colors sm:p-6",
          featured
            ? "border-border-gold/50 shadow-[0_0_32px_-16px_rgba(201,169,106,0.35)]"
            : "border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <Quote
            className="h-7 w-7 shrink-0 text-primary/40"
            strokeWidth={1.25}
            aria-hidden
          />
          <AnimatedStarRating rating={review.rating} />
        </div>

        <blockquote className="mt-4 flex-1">
          <p
            className={cn(
              "text-sm leading-relaxed text-foreground/80 sm:text-[0.95rem]",
              featured ? "line-clamp-6" : "line-clamp-4"
            )}
          >
            &ldquo;{review.text}&rdquo;
          </p>
        </blockquote>

        <footer className="mt-6 flex items-center gap-3 border-t border-border pt-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-gold/40 bg-primary/10 font-mono text-[11px] font-semibold tracking-wide text-primary"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <cite className="block truncate text-sm font-medium not-italic text-foreground">
              {review.name}
            </cite>
            {review.role ? (
              <p className="truncate text-xs text-muted-foreground">
                {review.role}
              </p>
            ) : null}
          </div>
        </footer>
      </article>

      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 z-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={t("openReview", { name: review.name })}
        />
      ) : null}
    </div>
  );
}
