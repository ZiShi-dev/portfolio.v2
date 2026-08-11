export const OPEN_LEAVE_REVIEW_EVENT = "open-leave-review-modal";
export const CLOSE_LEAVE_REVIEW_EVENT = "close-leave-review-modal";
export const OPEN_REVIEW_QUERY = "openReview";

export function openLeaveReviewModal(e?: { preventDefault?: () => void }) {
  e?.preventDefault?.();
  document.dispatchEvent(new CustomEvent(OPEN_LEAVE_REVIEW_EVENT));
}

/** Ferme la modale avis (succès formulaire, navigation, etc.). */
export function closeLeaveReviewModal() {
  document.dispatchEvent(new CustomEvent(CLOSE_LEAVE_REVIEW_EVENT));
}
