export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 5;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

/**
 * IP client pour rate-limits / audit.
 * Préfère les en-têtes plateforme (non spoofables) avant X-Forwarded-For.
 */
export function getClientIp(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) {
    return vercel.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    // Vercel contrôle XFF : première IP = client.
    // Hors plateforme de confiance : dernière IP = hop le plus proche.
    if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) {
      return parts[0] || "unknown";
    }
    return parts[parts.length - 1] || "unknown";
  }

  return "unknown";
}

export function checkRateLimitInStore(
  store: Map<string, RateLimitEntry>,
  key: string,
  now = Date.now(),
  windowMs = RATE_LIMIT_WINDOW_MS,
  maxRequests = RATE_LIMIT_MAX_REQUESTS
): { allowed: boolean; retryAfterSec?: number } {
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true };
}

export function pruneRateLimitStore(
  store: Map<string, RateLimitEntry>,
  now = Date.now()
) {
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) store.delete(key);
  }
}
