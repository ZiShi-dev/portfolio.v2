const DEFAULT_SITE_URL = "https://vorzix.com";

export function canonicalSiteUrl(siteUrl = process.env.NEXT_PUBLIC_SITE_URL) {
  const raw = (siteUrl || DEFAULT_SITE_URL).trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}

/**
 * www.vorzix.com → https://vorzix.com (hôte canonique).
 * Ne touche pas aux autres hôtes (preview, localhost).
 */
export function wwwToApexRedirectLocation(
  requestUrl: string,
  hostHeader: string | null | undefined,
  siteUrl = canonicalSiteUrl()
): string | null {
  const hostname = (hostHeader ?? "").split(":")[0]?.toLowerCase() ?? "";
  let apex: string;
  try {
    apex = new URL(siteUrl).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
  if (!apex || hostname !== `www.${apex}`) return null;

  try {
    const incoming = new URL(requestUrl);
    const canonical = new URL(siteUrl);
    canonical.pathname = incoming.pathname;
    canonical.search = incoming.search;
    canonical.hash = incoming.hash;
    return canonical.toString();
  } catch {
    return null;
  }
}

/** Slash final → URL sans slash (hors « / »). */
export function trailingSlashRedirectLocation(
  requestUrl: string
): string | null {
  try {
    const url = new URL(requestUrl);
    const { pathname } = url;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      url.pathname = pathname.replace(/\/+$/, "") || "/";
      return url.toString();
    }
  } catch {
    return null;
  }
  return null;
}
