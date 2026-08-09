import { revalidatePath } from "next/cache";

/** Invalide les surfaces publiques liées aux Case Studies. */
export function revalidateProjectSurfaces(slug?: string | null) {
  revalidatePath("/", "layout");
  revalidatePath("/projets");
  if (slug) {
    revalidatePath(`/projets/${slug}`);
  }
}
