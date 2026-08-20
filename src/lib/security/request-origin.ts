const LOCAL_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
] as const;

const SAFE_REQUEST_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Les methodes qui modifient l'etat doivent etre protegees contre le CSRF. */
export function requestMethodRequiresOrigin(method: string): boolean {
  return !SAFE_REQUEST_METHODS.has(method.toUpperCase());
}

function parseOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Host HTTP valide (pas d'injection via chemins / credentials). */
function isSafeHost(host: string): boolean {
  if (!host || host.length > 253) return false;
  if (host.includes("/") || host.includes("\\") || host.includes("@")) return false;
  if (host.includes(" ") || host.includes("\t") || host.includes("\n")) return false;
  return true;
}

/** Ajoute apex + www pour le même domaine (redirections Vercel). */
function addSiteOriginVariants(origins: Set<string>, siteUrl: string) {
  const origin = parseOrigin(siteUrl);
  if (!origin) return;

  origins.add(origin);

  try {
    const url = new URL(siteUrl);
    const host = url.hostname;
    if (host.startsWith("www.")) {
      origins.add(`${url.protocol}//${host.slice(4)}`);
    } else if (host.includes(".")) {
      origins.add(`${url.protocol}//www.${host}`);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Origine cible de la requête (Host / X-Forwarded-* de plateforme).
 * Permet les POST same-origin même si NEXT_PUBLIC_SITE_URL pointe ailleurs
 * (preview Vercel, domaine custom, URL de déploiement).
 *
 * X-Forwarded-* n'est pris en compte que sur Vercel (`VERCEL=1`) ou s'il
 * concorde avec `Host` — pour éviter le spoofing côté client.
 */
export function getRequestTargetOrigin(request: Request): string | null {
  const hostHeader = request.headers.get("host")?.trim() || "";
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();

  const trustForwarded =
    process.env.VERCEL === "1" ||
    Boolean(forwardedHost && hostHeader && forwardedHost === hostHeader);

  const host = (trustForwarded && forwardedHost) || hostHeader;
  if (!host || !isSafeHost(host)) return null;

  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    ?.toLowerCase();

  let proto: string | undefined;
  if (
    trustForwarded &&
    (forwardedProto === "http" || forwardedProto === "https")
  ) {
    proto = forwardedProto;
  } else {
    try {
      proto = new URL(request.url).protocol.replace(":", "");
    } catch {
      proto = "https";
    }
  }

  if (proto !== "http" && proto !== "https") return null;

  return parseOrigin(`${proto}://${host}`);
}

function addVercelDeploymentOrigins(origins: Set<string>) {
  for (const envKey of [
    "VERCEL_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
  ] as const) {
    const raw = process.env[envKey]?.trim();
    if (!raw) continue;
    const url = raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
    addSiteOriginVariants(origins, url);
  }
}

/** Origines autorisées pour les POST formulaire (anti-CSRF / anti-abus direct API). */
export function getAllowedFormOrigins(): Set<string> {
  const origins = new Set<string>();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    addSiteOriginVariants(origins, siteUrl);
  }

  const extras = process.env.FORM_ALLOWED_ORIGINS?.split(",") ?? [];
  for (const entry of extras) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    addSiteOriginVariants(origins, trimmed);
  }

  addVercelDeploymentOrigins(origins);

  if (process.env.NODE_ENV !== "production") {
    for (const origin of LOCAL_DEV_ORIGINS) origins.add(origin);
  }

  return origins;
}

export function isAllowedFormOrigin(origin: string, allowed: Set<string>): boolean {
  return allowed.has(origin);
}

/**
 * Vérifie Origin ou Referer.
 * En production, rejette les requêtes sans en-tête d'origine fiable.
 * Accepte aussi l'origine same-site dérivée du Host de la requête.
 */
export function verifyFormRequestOrigin(request: Request): boolean {
  const allowed = getAllowedFormOrigins();
  const requestOrigin = getRequestTargetOrigin(request);
  if (requestOrigin) {
    allowed.add(requestOrigin);
  }

  if (allowed.size === 0) return process.env.NODE_ENV !== "production";

  const origin = request.headers.get("origin");
  if (origin) {
    const parsed = parseOrigin(origin);
    return parsed !== null && isAllowedFormOrigin(parsed, allowed);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    const parsed = parseOrigin(referer);
    return parsed !== null && isAllowedFormOrigin(parsed, allowed);
  }

  return process.env.NODE_ENV !== "production";
}
