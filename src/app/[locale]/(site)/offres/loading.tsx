import { PageWithBackSkeleton } from "@/components/skeletons/site-route-skeletons";

export default function Loading() {
  return <PageWithBackSkeleton cards={3} columns="sm:grid-cols-2 md:grid-cols-3" />;
}
