import { revalidateTag, revalidatePath } from "next/cache";

/** Invalide Home + catalogue offres (FAQ générales / liées). */
export function revalidateFaqSurfaces(serviceSlugs?: string[]) {
  revalidateTag('public:faqs', { expire: 0 });
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
