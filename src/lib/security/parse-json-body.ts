import { FORM_SECURITY } from "@/lib/security/constants";

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export type ParseJsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; reason: "too_large" | "invalid_json" | "invalid_shape" | "dangerous_keys" };

function hasDangerousKeys(value: Record<string, unknown>): boolean {
  return Object.keys(value).some((key) => DANGEROUS_KEYS.has(key));
}

async function readBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<
  | { ok: true; text: string }
  | { ok: false; reason: "too_large" | "invalid_json" }
> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const length = Number.parseInt(contentLength, 10);
    if (Number.isFinite(length) && length > maxBytes) {
      return { ok: false, reason: "too_large" };
    }
  }

  const stream = request.body;
  if (!stream) {
    try {
      const text = await request.text();
      if (new TextEncoder().encode(text).byteLength > maxBytes) {
        return { ok: false, reason: "too_large" };
      }
      return { ok: true, text };
    } catch {
      return { ok: false, reason: "invalid_json" };
    }
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, text: new TextDecoder("utf-8").decode(merged) };
}

/** Parse JSON avec limite de taille stricte (stream) et garde-fous structurels. */
export async function parseJsonBody(
  request: Request,
  maxBytes: number = FORM_SECURITY.MAX_BODY_BYTES
): Promise<ParseJsonBodyResult> {
  const read = await readBodyWithLimit(request, maxBytes);
  if (!read.ok) return read;

  const { text } = read;

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

  if (hasDangerousKeys(record)) {
    return { ok: false, reason: "dangerous_keys" };
  }

  return { ok: true, body };
}
