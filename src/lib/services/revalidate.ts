import { revalidatePath } from "next/cache";

/** Invalide les surfaces publiques liées aux offres / services / à vendre. */
export function revalidateServiceSurfaces(slug?: string | null) {
  revalidatePath("/", "layout");
  revalidatePath("/offres");
  revalidatePath("/services");
  revalidatePath("/a-vendre");
  if (slug) {
    revalidatePath(`/offres/${slug}`);
    revalidatePath(`/services/${slug}`);
    revalidatePath(`/a-vendre/${slug}`);
  }
}
