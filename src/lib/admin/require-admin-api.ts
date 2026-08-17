import type { User, SupabaseClient } from "@supabase/supabase-js";
import { isAllowedAdminEmail } from "@/lib/admin/allowlist";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import { adminErrorResponse } from "@/lib/admin/error-response";
import { hasAdminMfaSatisfied } from "@/lib/admin/mfa";
import {
  requestMethodRequiresOrigin,
  verifyFormRequestOrigin,
} from "@/lib/security/request-origin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminGuardOk = {
  ok: true;
  user: User;
  supabase: SupabaseClient;
};

export type AdminGuardFail = {
  ok: false;
  response: Response;
};

/**
 * OWASP A01: session valide + allowlist + AAL2.
 * Les mutations verifient l'origine par defaut pour eviter un oubli CSRF.
 */
export async function requireAdminApi(
  request: Request,
  options?: { requireOrigin?: boolean }
): Promise<AdminGuardOk | AdminGuardFail> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      response: adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503),
    };
  }

  const requiresOrigin =
    options?.requireOrigin ?? requestMethodRequiresOrigin(request.method);

  if (requiresOrigin && !verifyFormRequestOrigin(request)) {
    return {
      ok: false,
      response: adminErrorResponse(ADMIN_ERROR_CODES.UNAUTHORIZED_ORIGIN, 403),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAllowedAdminEmail(user.email)) {
    return {
      ok: false,
      response: adminErrorResponse(ADMIN_ERROR_CODES.SESSION_EXPIRED, 401),
    };
  }

  if (!(await hasAdminMfaSatisfied(supabase, user))) {
    return {
      ok: false,
      response: adminErrorResponse(ADMIN_ERROR_CODES.MFA_REQUIRED, 403),
    };
  }

  return { ok: true, user, supabase };
}
