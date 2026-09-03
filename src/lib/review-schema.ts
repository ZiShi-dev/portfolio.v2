import {
  isHoneypotTriggered,
  isValidEmail,
  normalizeEmail,
  sanitizePersonName,
  sanitizeText,
} from "@/lib/form-validation";
import { ValidationErrors } from "@/lib/validation-errors";

export const REVIEW_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  roleMax: 120,
  messageMin: 10,
  messageMax: 2000,
} as const;

export type ReviewPayload = {
  name: string;
  email: string;
  role?: string;
  rating: number;
  message: string;
  projectId?: string;
};

export type ReviewValidationResult =
  | { ok: true; data: ReviewPayload }
  | { ok: false; error: string; field?: string };

function trimOptionalEmail(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = normalizeEmail(sanitizeText(value, max));
  return trimmed || undefined;
}

function trimOptionalText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = sanitizeText(value, max);
  return trimmed || undefined;
}

export function parseReviewPayload(body: unknown): ReviewValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: ValidationErrors.invalidRequest };
  }

  const raw = body as Record<string, unknown>;

  if (isHoneypotTriggered(typeof raw._honeypot === "string" ? raw._honeypot : "")) {
    return { ok: false, error: "honeypot" };
  }

  const name = sanitizePersonName(
    typeof raw.name === "string" ? raw.name : "",
    REVIEW_LIMITS.nameMax
  );
  const message = sanitizeText(
    typeof raw.message === "string" ? raw.message : "",
    REVIEW_LIMITS.messageMax
  );
  const emailRaw = trimOptionalEmail(raw.email, REVIEW_LIMITS.emailMax);
  if (!emailRaw) {
    return { ok: false, error: ValidationErrors.emailRequired, field: "email" };
  }
  if (!isValidEmail(emailRaw)) {
    return { ok: false, error: ValidationErrors.emailInvalid, field: "email" };
  }
  const email = emailRaw;
  const roleRaw = trimOptionalText(raw.role, REVIEW_LIMITS.roleMax);
  const role = roleRaw
    ? sanitizePersonName(roleRaw, REVIEW_LIMITS.roleMax) || undefined
    : undefined;

  const ratingRaw = raw.rating;
  if (typeof ratingRaw !== "number" || !Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { ok: false, error: ValidationErrors.ratingInvalidRange, field: "rating" };
  }
  const ratingNum = ratingRaw;

  if (name.length < REVIEW_LIMITS.nameMin) {
    return { ok: false, error: ValidationErrors.nameTooShort, field: "name" };
  }

  if (message.length < REVIEW_LIMITS.messageMin) {
    return { ok: false, error: ValidationErrors.messageTooShortMin, field: "message" };
  }

  const projectIdRaw =
    typeof raw.projectId === "string" ? raw.projectId.trim() : "";
  const projectId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    projectIdRaw
  )
    ? projectIdRaw
    : undefined;

  return {
    ok: true,
    data: { name, email, role, rating: ratingNum, message, projectId },
  };
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (process.env.NODE_ENV === "production" && isBlockedSsrfHost(parsed.hostname)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Hôtes interdits pour les URLs publiques (OWASP A10 — SSRF / metadata). */
export function isBlockedSsrfHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return true;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "169.254.169.254" || host === "metadata.google.internal") return true;

  if (host.includes(":")) {
    // IPv6 loopback / link-local simplifié
    if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
      return true;
    }
    return false;
  }

  const parts = host.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  return false;
}
