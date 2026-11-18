import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedAdminEmail, isAdminConfigured } from "@/lib/admin/allowlist";
import { ADMIN_ROUTES, ADMIN_SESSION_COOKIE_OPTIONS } from "@/lib/admin/constants";
import { adminHasVerifiedTotp, hasAdminMfaSatisfied } from "@/lib/admin/mfa";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type AdminSessionResult = {
  response: NextResponse;
  user: { id: string; email?: string } | null;
};

/**
 * Rafraîchit la session Supabase et protège les routes /admin.
 * À appeler depuis le proxy Next.js.
 */
export async function handleAdminSession(request: NextRequest): Promise<AdminSessionResult> {
  const config = getSupabaseConfig();
  const path = request.nextUrl.pathname;
  const isLoginRoute = path === ADMIN_ROUTES.login;
  const isAdminRoute = path.startsWith("/admin");

  if (!config.ok || !isAdminRoute) {
    return { response: NextResponse.next({ request }), user: null };
  }

  let response = NextResponse.next({ request });
  const redirect = (url: URL) => {
    const redirected = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) {
      redirected.cookies.set(cookie);
    }
    return redirected;
  };

  const supabase = createServerClient(config.config.url, config.config.anonKey, {
    cookieOptions: ADMIN_SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        const updated = NextResponse.next({ request });
        for (const cookie of response.cookies.getAll()) {
          updated.cookies.set(cookie);
        }
        cookiesToSet.forEach(({ name, value, options }) => {
          updated.cookies.set(name, value, options);
        });
        response = updated;
      },
    },
  });

  // Auth-js proxy : ne pas logger session.user lu depuis les cookies.
  (
    supabase.auth as unknown as { suppressGetSessionWarning: boolean }
  ).suppressGetSessionWarning = true;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminReady = isAdminConfigured();
  const isAdmin = isAllowedAdminEmail(user?.email);

  if (!adminReady && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_ROUTES.login;
    url.searchParams.set("error", "config");
    return { response: redirect(url), user: null };
  }

  if (isLoginRoute) {
    if (user && isAdmin) {
      const mfaOk = await hasAdminMfaSatisfied(supabase, user);
      if (mfaOk) {
        const url = request.nextUrl.clone();
        url.pathname = ADMIN_ROUTES.home;
        url.search = "";
        return { response: redirect(url), user };
      }

      return { response, user };
    }

    if (user && !isAdmin) {
      await supabase.auth.signOut({ scope: "local" });
    }

    return { response, user: null };
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_ROUTES.login;
    url.searchParams.set("next", path);
    return { response: redirect(url), user: null };
  }

  if (!isAdmin) {
    await supabase.auth.signOut({ scope: "local" });
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_ROUTES.login;
    url.searchParams.set("error", "unauthorized");
    return { response: redirect(url), user: null };
  }

  const mfaOk = await hasAdminMfaSatisfied(supabase, user);
  if (!mfaOk) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_ROUTES.login;
    const hasTotp = await adminHasVerifiedTotp(supabase);
    url.searchParams.set("step", hasTotp ? "mfa" : "enroll");
    return { response: redirect(url), user };
  }

  return { response, user };
}
