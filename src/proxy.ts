import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  checkRateLimitInStore,
  getClientIp,
  pruneRateLimitStore,
} from "@/lib/rate-limit-core";
import {
  ADMIN_LOGIN_LIMITS,
  ADMIN_MFA_LIMITS,
  ADMIN_PASSWORD_CHANGE_LIMITS,
} from "@/lib/admin/constants";
import { ADMIN_ERROR_CODES, ADMIN_ERROR_MESSAGES } from "@/lib/admin/error-codes";
import { handleAdminSession } from "@/lib/supabase/proxy-session";
import { routing } from "@/i18n/routing";
import { redirectLegacyLocalePrefix } from "@/lib/i18n/legacy-locale-redirect";
import {
  trailingSlashRedirectLocation,
  wwwToApexRedirectLocation,
} from "@/lib/seo/url-normalization";

const handleI18nRouting = createIntlMiddleware(routing);
const CSP_HEADER = "Content-Security-Policy";

function secureDocumentResponse(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isDev ? " 'unsafe-eval'" : ""
    } https://challenges.cloudflare.com`,
    `style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ""}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self'",
    "connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co wss://*.supabase.co",
    "frame-src https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(CSP_HEADER, csp);

  // NextResponse encode les remplacements d'en-têtes de requête dans des
  // en-têtes internes. On les fusionne avec la réponse de next-intl/admin.
  const forwarding = NextResponse.next({
    request: { headers: requestHeaders },
  });
  forwarding.headers.forEach((value, key) => {
    if (
      key === "x-middleware-override-headers" ||
      key.startsWith("x-middleware-request-")
    ) {
      response.headers.set(key, value);
    }
  });

  response.headers.set(CSP_HEADER, csp);
  return response;
}

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const formStore = new Map<string, RateLimitEntry>();
const loginStore = new Map<string, RateLimitEntry>();
const passwordStore = new Map<string, RateLimitEntry>();
const mfaStore = new Map<string, RateLimitEntry>();

function formRateLimitResponse(retryAfterSec?: number) {
  return NextResponse.json(
    { error: "Trop de tentatives. Réessayez plus tard." },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        ...(retryAfterSec ? { "Retry-After": String(retryAfterSec) } : {}),
      },
    }
  );
}

function adminRateLimitProxyResponse(retryAfterSec?: number) {
  return NextResponse.json(
    {
      code: ADMIN_ERROR_CODES.RATE_LIMITED,
      error: ADMIN_ERROR_MESSAGES.rate_limited,
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        ...(retryAfterSec ? { "Retry-After": String(retryAfterSec) } : {}),
      },
    }
  );
}

function handleFormRateLimit(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405, headers: { "Cache-Control": "no-store" } }
    );
  }

  pruneRateLimitStore(formStore);

  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  const rateKey = path.includes("/contact")
    ? `contact:${ip}`
    : path.includes("/project-inquiry")
      ? `project-inquiry:${ip}`
      : `review:${ip}`;
  const rate = checkRateLimitInStore(formStore, rateKey);

  if (!rate.allowed) {
    return formRateLimitResponse(rate.retryAfterSec);
  }

  return NextResponse.next();
}

function handleAdminLoginRateLimit(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.next();
  }

  pruneRateLimitStore(loginStore);

  const ip = getClientIp(request);
  const rate = checkRateLimitInStore(
    loginStore,
    `admin-login:${ip}`,
    Date.now(),
    ADMIN_LOGIN_LIMITS.windowMs,
    ADMIN_LOGIN_LIMITS.maxAttempts
  );

  if (!rate.allowed) {
    return adminRateLimitProxyResponse(rate.retryAfterSec);
  }

  return NextResponse.next();
}

function handleAdminPasswordRateLimit(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.next();
  }

  pruneRateLimitStore(passwordStore);

  const ip = getClientIp(request);
  const rate = checkRateLimitInStore(
    passwordStore,
    `admin-password:${ip}`,
    Date.now(),
    ADMIN_PASSWORD_CHANGE_LIMITS.windowMs,
    ADMIN_PASSWORD_CHANGE_LIMITS.maxAttempts
  );

  if (!rate.allowed) {
    return adminRateLimitProxyResponse(rate.retryAfterSec);
  }

  return NextResponse.next();
}

function handleAdminMfaRateLimit(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.next();
  }

  pruneRateLimitStore(mfaStore);

  const ip = getClientIp(request);
  const rate = checkRateLimitInStore(
    mfaStore,
    `admin-mfa:${ip}`,
    Date.now(),
    ADMIN_MFA_LIMITS.windowMs,
    ADMIN_MFA_LIMITS.maxAttempts
  );

  if (!rate.allowed) {
    return adminRateLimitProxyResponse(rate.retryAfterSec);
  }

  return NextResponse.next();
}

/** Anciennes pages → sections de l’accueil. */
const HOME_SECTION_REDIRECTS: Record<string, string> = {
  "/a-propos": "/#a-propos",
};

function publicLocalePath(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (!routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    return { pathname, prefix: "" };
  }

  const rest = `/${segments.slice(2).join("/")}`;
  return {
    pathname: rest === "/" ? "/" : rest.replace(/\/$/, ""),
    prefix: maybeLocale === routing.defaultLocale ? "" : `/${maybeLocale}`,
  };
}

export async function proxy(request: NextRequest) {
  const wwwLocation = wwwToApexRedirectLocation(
    request.nextUrl.href,
    request.headers.get("host")
  );
  if (wwwLocation) {
    return NextResponse.redirect(wwwLocation, 308);
  }

  const slashLocation = trailingSlashRedirectLocation(request.nextUrl.href);
  if (slashLocation) {
    return NextResponse.redirect(slashLocation, 308);
  }

  const path = request.nextUrl.pathname;
  const localized = publicLocalePath(path);

  // Ancien chemin /services → catalogue /offres (+ détail)
  if (localized.pathname === "/services") {
    return NextResponse.redirect(
      new URL(`${localized.prefix}/offres`, request.url),
      308
    );
  }
  if (localized.pathname.startsWith("/services/")) {
    const slug = localized.pathname.slice("/services/".length);
    return NextResponse.redirect(
      new URL(`${localized.prefix}/offres/${slug}`, request.url),
      308
    );
  }

  const homeSection = HOME_SECTION_REDIRECTS[localized.pathname];
  if (homeSection) {
    return NextResponse.redirect(
      new URL(`${localized.prefix}${homeSection}`, request.url),
      308
    );
  }

  if (
    path === "/api/contact" ||
    path === "/api/review" ||
    path === "/api/project-inquiry"
  ) {
    return handleFormRateLimit(request);
  }

  if (path === "/api/admin/password") {
    const rateResponse = handleAdminPasswordRateLimit(request);
    if (rateResponse.status === 429) return rateResponse;
  }

  if (
    path === "/api/admin/login" ||
    path === "/api/admin/mfa/verify" ||
    path === "/api/admin/mfa/enroll/verify"
  ) {
    const rateResponse = handleAdminLoginRateLimit(request);
    if (rateResponse.status === 429) return rateResponse;
  }

  if (path === "/api/admin/mfa/challenge" || path === "/api/admin/mfa/enroll") {
    const rateResponse = handleAdminMfaRateLimit(request);
    if (rateResponse.status === 429) return rateResponse;
  }

  if (path.startsWith("/admin")) {
    const { response } = await handleAdminSession(request);
    return secureDocumentResponse(request, response);
  }

  if (
    !path.startsWith("/api") &&
    !path.startsWith("/_next") &&
    !path.includes(".")
  ) {
    const legacy = redirectLegacyLocalePrefix(request);
    if (legacy) return legacy;
    return secureDocumentResponse(request, handleI18nRouting(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/contact",
    "/api/review",
    "/api/project-inquiry",
    "/api/admin/login",
    "/api/admin/password",
    "/api/admin/mfa/verify",
    "/api/admin/mfa/challenge",
    "/api/admin/mfa/enroll",
    "/api/admin/mfa/enroll/verify",
    "/admin/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
