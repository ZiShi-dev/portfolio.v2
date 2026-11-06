import { HomeSkeleton } from "@/components/skeletons/site-route-skeletons";

/** Accueil uniquement — les autres routes ont leur `loading.tsx` dédié. */
export default function Loading() {
  return <HomeSkeleton />;
}
