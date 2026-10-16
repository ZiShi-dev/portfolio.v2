import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAllowedAdminEmail } from "@/lib/admin/allowlist";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { adminHasVerifiedTotp, hasAdminMfaSatisfied } from "@/lib/admin/mfa";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Check authorization at the page's data boundary as well as in the proxy. */
export async function requireAdminPageUser(): Promise<User> {
  if (!isSupabaseConfigured()) redirect(ADMIN_ROUTES.login);
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || !isAllowedAdminEmail(user.email)) redirect(ADMIN_ROUTES.login);
  if (!(await hasAdminMfaSatisfied(supabase, user))) {
    const step = await adminHasVerifiedTotp(supabase) ? "mfa" : "enroll";
    redirect(`${ADMIN_ROUTES.login}?step=${step}`);
  }
  return user;
}
