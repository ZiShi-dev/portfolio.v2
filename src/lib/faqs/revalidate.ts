import { revalidatePath } from "next/cache";

/** Invalide Home + catalogue offres (FAQ générales / liées). */
export function revalidateFaqSurfaces(serviceSlugs?: string[]) {
  revalidatePath("/", "layout");
  revalidatePath("/offres");
  revalidatePath("/services");
  if (serviceSlugs) {
    for (const slug of serviceSlugs) {
      if (!slug) continue;
      revalidatePath(`/offres/${slug}`);
      revalidatePath(`/services/${slug}`);
    }
  }
}
