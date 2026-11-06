import { HomeSkeleton } from "@/components/skeletons/site-route-skeletons";

/** Limité au segment accueil — évite d’empiler avec les `loading.tsx` des sous-routes `(site)`. */
export default function Loading() {
  return <HomeSkeleton />;
}
