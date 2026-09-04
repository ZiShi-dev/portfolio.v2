/**
 * Résolution IP client durcie (OWASP A04 — rate limiting fiable).
 * Sur Vercel, on privilégie x-vercel-forwarded-for (non spoofable par le client).
 */
export function getTrustedClientIp(request: Request): string {
  if (process.env.VERCEL === "1") {
    const vercelIp = request.headers.get("x-vercel-forwarded-for")?.trim();
    if (vercelIp) return vercelIp.split(",")[0]?.trim() || "unknown";

    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}
