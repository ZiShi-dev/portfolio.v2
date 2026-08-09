import { revalidatePath } from "next/cache";

/** Invalide les surfaces publiques liées aux engagements. */
export function revalidateEngagementSurfaces() {
  revalidatePath("/", "layout");
}
