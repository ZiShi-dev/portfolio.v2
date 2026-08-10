export type ReviewItem = {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  initials?: string;
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getReviewInitials(review: ReviewItem) {
  return review.initials ?? initialsFromName(review.name);
}
