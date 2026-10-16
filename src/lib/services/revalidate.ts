import { revalidateTag, revalidatePath } from "next/cache";

/** Invalide les surfaces publiques liées aux offres / services. */
export function revalidateServiceSurfaces(slug?: string | null) {
  revalidateTag('public:services', { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/offres");
  revalidatePath("/services");
  if (slug) {
    revalidatePath(`/offres/${slug}`);
    revalidatePath(`/services/${slug}`);
  }
}
