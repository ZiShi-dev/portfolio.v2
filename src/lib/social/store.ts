import {
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_SITE_SETTINGS,
  normalizeContactPriority,
  type SiteSettings,
} from "@/data/site-social";
import { isValidEmail, normalizeEmail } from "@/lib/form-validation";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

type SiteSocialRow = {
  contact_email?: string | null;
  discord: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  facebook?: string | null;
  contact_priority?: string[] | null;
  updated_at?: string;
};

const LEGACY_COLUMNS = "contact_email, discord, whatsapp, instagram, tiktok";
const SOCIAL_COLUMNS = `${LEGACY_COLUMNS}, facebook`;
const ROW_COLUMNS = `${SOCIAL_COLUMNS}, contact_priority`;
const ROW_COLUMNS_WITH_META = `${ROW_COLUMNS}, updated_at`;
const SOCIAL_COLUMNS_WITH_META = `${SOCIAL_COLUMNS}, updated_at`;
const LEGACY_COLUMNS_WITH_META = `${LEGACY_COLUMNS}, updated_at`;

type SupabaseError = { code?: string; message?: string } | null;

/**
 * Vrai entre un déploiement et `npm run db:migrate` : la colonne existe dans le code
 * mais pas encore en base. On relit alors sans elle plutôt que de vider le footer.
 */
function isMissingContactPriority(error: SupabaseError): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  return String(error.message ?? "").includes("contact_priority");
}

function isMissingFacebook(error: SupabaseError): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  return String(error.message ?? "").includes("facebook");
}

function defaultSettings(): SiteSettings {
  return {
    ...DEFAULT_SITE_SETTINGS,
    contactPriority: [...DEFAULT_SITE_SETTINGS.contactPriority],
  };
}

function normalizeContactEmail(raw: string | null | undefined): string {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return DEFAULT_CONTACT_EMAIL;
  const normalized = normalizeEmail(trimmed);
  return isValidEmail(normalized) ? normalized : DEFAULT_CONTACT_EMAIL;
}

/** Les colonnes sélectionnées sont dynamiques : supabase-js ne peut pas les typer. */
function toRow(data: unknown): SiteSocialRow {
  return data as SiteSocialRow;
}

function rowToValues(row: SiteSocialRow): SiteSettings {
  return {
    contactEmail: normalizeContactEmail(row.contact_email),
    discord: String(row.discord ?? "").trim(),
    whatsapp: String(row.whatsapp ?? "").trim(),
    instagram: String(row.instagram ?? "").trim(),
    tiktok: String(row.tiktok ?? "").trim(),
    facebook: String(row.facebook ?? "").trim(),
    contactPriority: normalizeContactPriority(row.contact_priority),
  };
}

async function readSiteSocialRow(
  supabase: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  columns: string
) {
  return supabase
    .from("site_social_links")
    .select(columns)
    .eq("id", "default")
    .maybeSingle();
}

async function fetchSiteSocialRow(
  supabase: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  withMeta: boolean
) {
  const full = withMeta ? ROW_COLUMNS_WITH_META : ROW_COLUMNS;
  let { data, error } = await readSiteSocialRow(supabase, full);
  if (isMissingContactPriority(error)) {
    ({ data, error } = await readSiteSocialRow(
      supabase,
      withMeta ? SOCIAL_COLUMNS_WITH_META : SOCIAL_COLUMNS
    ));
  }
  if (isMissingFacebook(error)) {
    ({ data, error } = await readSiteSocialRow(
      supabase,
      withMeta ? LEGACY_COLUMNS_WITH_META : LEGACY_COLUMNS
    ));
  }
  return { data, error };
}

/** Réglages publics (footer / SEO / affichage email). */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseServiceConfigured()) {
    return defaultSettings();
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) return defaultSettings();

  const { data, error } = await fetchSiteSocialRow(supabase, false);

  if (error || !data) {
    return defaultSettings();
  }

  return rowToValues(toRow(data));
}

/** Email affiché sur le site. */
export async function getPublicContactEmail(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.contactEmail;
}

/** Liens réseaux seuls (compat footer). */
export async function getSiteSocialLinks() {
  const settings = await getSiteSettings();
  return {
    discord: settings.discord,
    whatsapp: settings.whatsapp,
    instagram: settings.instagram,
    tiktok: settings.tiktok,
    facebook: settings.facebook,
  };
}

export type GetSiteSocialAdminResult =
  | {
      ok: true;
      configured: true;
      settings: SiteSettings;
      updatedAt: string | null;
    }
  | {
      ok: true;
      configured: false;
      settings: SiteSettings;
      updatedAt: null;
    }
  | { ok: false; reason: "not_configured" | "persist_failed" };

/** @deprecated alias — préférer getSiteSettingsForAdmin */
export async function getSiteSocialForAdmin(): Promise<GetSiteSocialAdminResult> {
  return getSiteSettingsForAdmin();
}

export async function getSiteSettingsForAdmin(): Promise<GetSiteSocialAdminResult> {
  if (!isSupabaseServiceConfigured()) {
    return {
      ok: true,
      configured: false,
      settings: defaultSettings(),
      updatedAt: null,
    };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return {
      ok: true,
      configured: false,
      settings: defaultSettings(),
      updatedAt: null,
    };
  }

  let { data, error } = await fetchSiteSocialRow(supabase, true);

  if (error) {
    console.error("[site-social]", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  if (!data) {
    const seeded = await upsertSiteSocialLinks(defaultSettings());
    if (!seeded.ok) return { ok: false, reason: "persist_failed" };
    return {
      ok: true,
      configured: true,
      settings: seeded.settings,
      updatedAt: seeded.updatedAt,
    };
  }

  return {
    ok: true,
    configured: true,
    settings: rowToValues(toRow(data)),
    updatedAt: toRow(data).updated_at ?? null,
  };
}

export type UpsertSiteSocialResult =
  | { ok: true; settings: SiteSettings; updatedAt: string }
  | { ok: false; reason: "not_configured" | "persist_failed" };

export async function upsertSiteSocialLinks(
  values: SiteSettings
): Promise<UpsertSiteSocialResult> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "not_configured" };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, reason: "not_configured" };
  }

  const updatedAt = new Date().toISOString();
  const baseRow = {
    id: "default",
    contact_email: values.contactEmail,
    discord: values.discord,
    whatsapp: values.whatsapp,
    instagram: values.instagram,
    tiktok: values.tiktok,
    facebook: values.facebook,
    updated_at: updatedAt,
  };

  const write = (row: Record<string, unknown>, columns: string) =>
    supabase
      .from("site_social_links")
      .upsert(row, { onConflict: "id" })
      .select(columns)
      .single();

  let { data, error } = await write(
    {
      ...baseRow,
      contact_priority: normalizeContactPriority(values.contactPriority),
    },
    ROW_COLUMNS_WITH_META
  );
  if (isMissingContactPriority(error)) {
    ({ data, error } = await write(baseRow, SOCIAL_COLUMNS_WITH_META));
  }
  if (isMissingFacebook(error)) {
    const { facebook: _fb, ...legacyRow } = baseRow;
    ({ data, error } = await write(legacyRow, LEGACY_COLUMNS_WITH_META));
  }

  if (error || !data) {
    if (error) console.error("[site-social] upsert", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  return {
    ok: true,
    settings: rowToValues(toRow(data)),
    updatedAt: toRow(data).updated_at ?? updatedAt,
  };
}
