"use client";

import { useTranslations } from "next-intl";
import { openLeaveReviewModal } from "@/lib/open-leave-review-modal";

export function FooterLeaveReviewLink() {
  const t = useTranslations("nav");

  return (
    <button
      type="button"
      onClick={() => openLeaveReviewModal()}
      className="inline-flex min-h-11 items-center rounded-sm text-sm text-foreground/65 underline-offset-4 transition-colors hover:text-step-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {t("leaveReview")}
    </button>
  );
}
