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

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

/**
 * Turnstile obligatoire en production par défaut.
 * Désactiver en prod uniquement avec FORM_REQUIRE_TURNSTILE=false
 * ET FORM_ALLOW_INSECURE=true (staging / diagnostic).
 */
export function isTurnstileRequired(): boolean {
  const explicit = readBoolEnv("FORM_REQUIRE_TURNSTILE");
  if (explicit === false) {
    const allowInsecure = readBoolEnv("FORM_ALLOW_INSECURE") === true;
    if (isProductionRuntime() && !allowInsecure) {
      console.error(
        "[security] FORM_REQUIRE_TURNSTILE=false ignoré en production sans FORM_ALLOW_INSECURE=true"
      );
      return true;
    }
    return false;
  }
  if (explicit === true) return true;
  return process.env.NODE_ENV === "production";
}

export function getTurnstileGuardFailure(): "missing_config" | null {
  if (!isTurnstileRequired()) return null;
  if (isTurnstileEnabled() && isTurnstileSiteKeyConfigured()) return null;
  return "missing_config";
}
