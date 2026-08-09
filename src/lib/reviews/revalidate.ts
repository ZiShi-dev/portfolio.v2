import { revalidatePath } from "next/cache";

/** Invalide les surfaces publiques liées aux avis. */
export function revalidateReviewSurfaces() {
  // layout = toutes les pages sous la locale (accueil + avis + projets)
  revalidatePath("/", "layout");
  revalidatePath("/avis", "page");
  revalidatePath("/projets", "layout");
}
