import { revalidateTag, revalidatePath } from "next/cache";

/** Invalide les surfaces publiques liées aux engagements. */
export function revalidateEngagementSurfaces() {
  revalidateTag('public:engagements', { expire: 0 });
  revalidatePath("/", "layout");
}
