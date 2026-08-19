export type TurnstileClientErrorKind =
  | "configuration"
  | "network"
  | "challenge";

const CONFIGURATION_CODES = new Set([
  "110100", // sitekey invalide
  "110110", // sitekey introuvable
  "110200", // hostname non autorisé
  "400020", // sitekey invalide
  "400070", // sitekey désactivée
]);

/** Classe les codes publics documentés par Cloudflare sans exposer de secret. */
export function classifyTurnstileClientError(
  errorCode: string
): TurnstileClientErrorKind {
  const code = String(errorCode).trim();
  if (CONFIGURATION_CODES.has(code)) return "configuration";
  if (code === "200500" || code === "script_load_error") return "network";
  return "challenge";
}
