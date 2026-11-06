import { PageWithBackSkeleton } from "@/components/skeletons/site-route-skeletons";

export default function Loading() {
  return <PageWithBackSkeleton cards={2} columns="sm:grid-cols-1" />;
}
