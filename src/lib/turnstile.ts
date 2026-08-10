import { FORM_SECURITY } from "@/lib/security/constants";
import { getAllowedFormOrigins } from "@/lib/security/request-origin";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteverifyResponse = {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export function isTurnstileSiteKeyConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}

function hasExpectedTurnstileContext(
  data: SiteverifyResponse,
  expectedAction?: string
): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const allowedHostnames = new Set<string>();
  for (const origin of getAllowedFormOrigins()) {
    try {
      allowedHostnames.add(new URL(origin).hostname);
    } catch {
      // Origine déjà filtrée par request-origin ; ignorer une valeur invalide.
    }
  }

  if (
    allowedHostnames.size === 0 ||
    !data.hostname ||
    !allowedHostnames.has(data.hostname)
  ) {
    return false;
  }

  return !expectedAction || data.action === expectedAction;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp: string,
  expectedAction?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;

  const response = token.trim();
  if (!response || response.length > 2048) return false;

  try {
    const params = new URLSearchParams({
      secret,
      response,
    });
    // IP optionnelle : une IP mal formée peut faire échouer siteverify.
    if (remoteIp && remoteIp !== "unknown") {
      params.set("remoteip", remoteIp);
    }

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      signal: AbortSignal.timeout(FORM_SECURITY.TURNSTILE_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error("[turnstile] siteverify HTTP", res.status);
      return false;
    }

    const data = (await res.json()) as SiteverifyResponse;
    if (!data.success) {
      const codes = data["error-codes"] ?? [];
      console.error("[turnstile] verification failed", codes);
      // Aide au diagnostic Vercel : secret de test vs token réel, etc.
      if (codes.includes("invalid-input-secret")) {
        console.error(
          "[turnstile] Secret key invalide ou ne correspond pas à la site key du widget"
        );
      }
    }
    if (!data.success) return false;
    if (!hasExpectedTurnstileContext(data, expectedAction)) {
      console.error("[turnstile] hostname/action mismatch");
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      "[turnstile] siteverify error",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}
