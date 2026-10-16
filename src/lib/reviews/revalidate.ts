import { revalidateTag, revalidatePath } from "next/cache";

/** Invalide les surfaces publiques liées aux avis. */
export function revalidateReviewSurfaces() {
  // layout = toutes les pages sous la locale (accueil + avis + projets)
  revalidateTag('public:reviews', { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/avis", "page");
  revalidatePath("/projets", "layout");
}
