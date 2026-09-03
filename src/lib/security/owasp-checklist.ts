/**
 * Matrice de conformité OWASP Top 10 (2021) — contrôles vérifiés par tests.
 * Chaque entrée mappe un risque OWASP à un mécanisme du projet.
 */
export const OWASP_CONTROLS = [
  {
    id: "A01",
    name: "Broken Access Control",
    controls: [
      "requireAdminApi (session + allowlist + MFA)",
      "verifyFormRequestOrigin (CSRF formulaires publics + admin mutations)",
      "Schémas Zod stricts (mass-assignment refusé)",
      "Routes admin sous /admin uniquement",
    ],
  },
  {
    id: "A02",
    name: "Cryptographic Failures",
    controls: [
      "hashForAudit (pas de PII en clair dans les logs)",
      "Cookies session Supabase (secure en prod via SSR)",
      "HSTS en production (next.config)",
    ],
  },
  {
    id: "A03",
    name: "Injection",
    controls: [
      "Sanitisation XSS contact / avis / email",
      "Zod + limites de longueur sur tous les payloads",
      "Échappement HTML dans les templates email",
    ],
  },
  {
    id: "A04",
    name: "Insecure Design",
    controls: [
      "Rate limit IP (proxy) + email + journalier",
      "Honeypot formulaires publics",
      "Déduplication anti double-clic",
      "Magic bytes upload images",
      "getTrustedClientIp (Vercel anti-spoof)",
    ],
  },
  {
    id: "A05",
    name: "Security Misconfiguration",
    controls: [
      "Turnstile fail-closed en production",
      "CSP nonce (proxy.ts)",
      "Headers sécurité (X-Frame-Options, nosniff, COOP, CORP)",
      "robots.txt disallow /admin /api",
      "poweredByHeader: false",
    ],
  },
  {
    id: "A07",
    name: "Identification and Authentication Failures",
    controls: [
      "Verrouillage compte admin (account-lockout)",
      "MFA TOTP obligatoire (AAL2)",
      "Allowlist email admin",
      "Rate limit login / MFA / changement mot de passe",
    ],
  },
  {
    id: "A08",
    name: "Software and Data Integrity Failures",
    controls: [
      "parseJsonBody (taille, forme, clés dangereuses profondes)",
      "Validation Turnstile hostname + action",
      "Content-Type JSON obligatoire sur les API formulaire",
    ],
  },
  {
    id: "A09",
    name: "Security Logging and Monitoring Failures",
    controls: [
      "logFormSecurityEvent (sans PII)",
      "logAdminAuthEvent (audit admin)",
      "Événements rate_limit / origin_rejected / turnstile_failed",
    ],
  },
  {
    id: "A10",
    name: "Server-Side Request Forgery",
    controls: [
      "isSafeHttpUrl sur liens projet / offre",
      "URLs images limitées à *.supabase.co (CSP + schéma)",
    ],
  },
] as const;

export type OwaspControlId = (typeof OWASP_CONTROLS)[number]["id"];
