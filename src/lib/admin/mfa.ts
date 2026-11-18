import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AdminMfaVerifyValues } from "@/lib/admin/mfa-schema";

export type AdminMfaChallenge = {
  factorId: string;
  challengeId: string;
};

/** Vérifie la signature du jeton utilisé pour autoriser la session admin. */
async function getAdminMfaAssuranceLevel(
  supabase: SupabaseClient,
  knownUser?: User | null
) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) return null;

  const token = session.access_token;
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) return null;

  const identity = knownUser ? null : await supabase.auth.getUser(token);
  const user = knownUser ?? identity?.data.user;
  if (identity?.error || !user || data.claims.sub !== user.id) return null;

  const hasVerifiedTotp = user.factors?.some(
    (factor) => factor.factor_type === "totp" && factor.status === "verified"
  ) ?? false;

  return { level: data.claims.aal, hasVerifiedTotp };
}

export async function hasAdminMfaSatisfied(
  supabase: SupabaseClient,
  knownUser?: User | null
): Promise<boolean> {
  const assurance = await getAdminMfaAssuranceLevel(supabase, knownUser);
  return assurance?.level === "aal2" && assurance.hasVerifiedTotp;
}

export async function adminMfaRequired(
  supabase: SupabaseClient,
  knownUser?: User | null
): Promise<boolean> {
  const assurance = await getAdminMfaAssuranceLevel(supabase, knownUser);
  return assurance?.level === "aal1" && assurance.hasVerifiedTotp;
}

/** L'utilisateur doit enrôler un facteur TOTP dans Supabase. */
export async function adminHasVerifiedTotp(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return false;
  return data.totp.some((factor) => factor.status === "verified");
}

export type AdminMfaEnrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

/** Nom affiché dans l’app TOTP (Google Authenticator, etc.). */
function totpIssuerFromSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://vorzix.com";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return host || "vorzix.com";
  } catch {
    return "vorzix.com";
  }
}

/** Démarre l'enrôlement TOTP (QR). Nettoie les facteurs non vérifiés restants. */
export async function startAdminMfaEnrollment(
  supabase: SupabaseClient
): Promise<
  | { ok: true; data: AdminMfaEnrollment }
  | { ok: false; error: "already_enrolled" | "enroll_failed" }
> {
  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError || !factorsData) return { ok: false, error: "enroll_failed" };
  if (factorsData.totp.length > 0) {
    return { ok: false, error: "already_enrolled" };
  }

  const pending = factorsData.all.filter(
    (factor) => factor.factor_type === "totp" && factor.status === "unverified"
  );

  for (const factor of pending) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) return { ok: false, error: "enroll_failed" };
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Admin portfolio",
    // Évite d’afficher localhost:3000 dans l’app TOTP (défaut = Site URL Supabase).
    issuer: totpIssuerFromSiteUrl(),
  });

  if (error || !data || data.type !== "totp" || !data.totp) {
    return { ok: false, error: "enroll_failed" };
  }

  return {
    ok: true,
    data: {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    },
  };
}

/** Confirme l'enrôlement avec le premier code TOTP (challenge + verify). */
export async function confirmAdminMfaEnrollment(
  supabase: SupabaseClient,
  input: { factorId: string; code: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: input.factorId,
  });

  if (challengeError || !challengeData) {
    return { ok: false, error: "challenge_failed" };
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: input.factorId,
    challengeId: challengeData.id,
    code: input.code,
  });

  if (verifyError) {
    return { ok: false, error: "invalid_code" };
  }

  return { ok: true };
}

export async function startAdminMfaChallenge(
  supabase: SupabaseClient
): Promise<
  | { ok: true; data: AdminMfaChallenge }
  | { ok: false; error: "no_factor" | "challenge_failed" }
> {
  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError || !factorsData) {
    return { ok: false, error: "no_factor" };
  }

  const totpFactor = factorsData.totp.find((factor) => factor.status === "verified");
  if (!totpFactor) {
    return { ok: false, error: "no_factor" };
  }

  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: totpFactor.id,
  });

  if (challengeError || !challengeData) {
    return { ok: false, error: "challenge_failed" };
  }

  return {
    ok: true,
    data: {
      factorId: totpFactor.id,
      challengeId: challengeData.id,
    },
  };
}

export async function verifyAdminTotpCode(
  supabase: SupabaseClient,
  input: AdminMfaVerifyValues
) {
  return supabase.auth.mfa.verify({
    factorId: input.factorId,
    challengeId: input.challengeId,
    code: input.code,
  });
}
