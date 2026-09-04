import { FORM_SECURITY } from "@/lib/security/constants";

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
/** Profondeur max pour éviter DoS JSON + pollution imbriquée (OWASP A08). */
const MAX_JSON_DEPTH = 8;

export type ParseJsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; reason: "too_large" | "invalid_json" | "invalid_shape" | "dangerous_keys" };

function hasDangerousKeysDeep(value: unknown, depth = 0): boolean {
  if (depth > MAX_JSON_DEPTH) return true;
  if (!value || typeof value !== "object") return false;

  if (Array.isArray(value)) {
    return value.some((item) => hasDangerousKeysDeep(item, depth + 1));
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (DANGEROUS_KEYS.has(key)) return true;
    if (hasDangerousKeysDeep(nested, depth + 1)) return true;
  }

  return false;
}

/** Parse JSON avec limite de taille et garde-fous structurels. */
export async function parseJsonBody(
  request: Request,
  maxBytes: number = FORM_SECURITY.MAX_BODY_BYTES
): Promise<ParseJsonBodyResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const length = Number.parseInt(contentLength, 10);
    if (Number.isFinite(length) && length > maxBytes) {
      return { ok: false, reason: "too_large" };
    }
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  if (text.length > maxBytes) {
    return { ok: false, reason: "too_large" };
  }

  if (!text.trim()) {
    return { ok: false, reason: "invalid_json" };
  }

  let body: unknown;
  try {
    body = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, reason: "invalid_shape" };
  }

  const record = body as Record<string, unknown>;

  if (Object.keys(record).length > FORM_SECURITY.MAX_ROOT_KEYS) {
    return { ok: false, reason: "invalid_shape" };
  }

  if (hasDangerousKeysDeep(record)) {
    return { ok: false, reason: "dangerous_keys" };
  }

  return { ok: true, body };
}
