import { createHash, timingSafeEqual } from "node:crypto";

/** Compare deux secrets sans révéler leur longueur. */
export function secretsMatch(left: string, right: string): boolean {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function cronAuthorized(request: Request, secret: string): boolean {
  const configured = secret.trim();
  if (!configured) return false;
  const header = request.headers.get("authorization")?.trim() ?? "";
  return secretsMatch(header, `Bearer ${configured}`);
}
