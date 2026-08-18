import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { NEXT_LOCALE_COOKIE } from "@/lib/locale-cookie";

/** `/fr/...` est redondant : le français canonique reste sans préfixe. */
export function redirectLegacyLocalePrefix(request: Request): Response | null {
  const { pathname, search } = new URL(request.url);
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (maybeLocale !== routing.defaultLocale) {
    return null;
  }

  const rest = "/" + segments.slice(2).join("/");
  const destination = new URL(
    (rest === "/" ? "/" : rest.replace(/\/$/, "") || "/") + search,
    request.url
  );

  const response = NextResponse.redirect(destination, 308);
  response.cookies.set(NEXT_LOCALE_COOKIE, maybeLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
