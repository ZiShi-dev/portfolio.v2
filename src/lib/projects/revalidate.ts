import { revalidateTag, revalidatePath } from "next/cache";

/** Invalide les surfaces publiques liées aux Case Studies. */
export function revalidateProjectSurfaces(slug?: string | null) {
  revalidateTag('public:projects', { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/projets", "layout");
  revalidatePath("/offres", "layout");
  if (slug) {
    revalidatePath(`/projets/${slug}`, "page");
  }
}
