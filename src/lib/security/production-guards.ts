import {
  isTurnstileEnabled,
  isTurnstileSiteKeyConfigured,
} from "@/lib/turnstile";

function readBoolEnv(name: string): boolean | undefined {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/**
 * Turnstile obligatoire en production par défaut.
 * En production, FORM_REQUIRE_TURNSTILE=false est ignoré sauf FORM_ALLOW_INSECURE=true
 * (OWASP A05 — fail-closed, pas de désactivation accidentelle en prod).
 */
export function isTurnstileRequired(): boolean {
  const explicit = readBoolEnv("FORM_REQUIRE_TURNSTILE");
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    if (explicit === false) {
      return readBoolEnv("FORM_ALLOW_INSECURE") === true ? false : true;
    }
    return explicit !== false;
  }

  if (explicit !== undefined) return explicit;
  return false;
}

export function getTurnstileGuardFailure(): "missing_config" | null {
  if (!isTurnstileRequired()) return null;
  if (isTurnstileEnabled() && isTurnstileSiteKeyConfigured()) return null;
  return "missing_config";
}
