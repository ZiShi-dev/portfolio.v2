import type { Locale } from "@/i18n/routing";
import {
  type EngagementLocale,
  type EngagementPatchInput,
  type EngagementStatus,
  type EngagementWriteInput,
  ENGAGEMENT_STATUSES,
} from "@/lib/engagements/schema";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

export type EngagementI18n = {
  fr: string;
  en: string;
  ar: string;
};

export type EngagementRow = {
  id: string;
  created_at: string;
  updated_at: string;
  reference: string;
  icon: string;
  status: EngagementStatus;
  sort_order: number;
  title: EngagementI18n;
  description: EngagementI18n;
  published_at: string | null;
};

export type LocalizedEngagement = {
  id: string;
  reference: string;
  icon: string;
  sortOrder: number;
  title: string;
  description: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ENGAGEMENT_SELECT =
  "id, created_at, updated_at, reference, icon, status, sort_order, title, description, published_at";

function asI18n(value: unknown, fallback = ""): EngagementI18n {
  const obj = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  return {
    fr: typeof obj.fr === "string" ? obj.fr : fallback,
    en: typeof obj.en === "string" ? obj.en : fallback,
    ar: typeof obj.ar === "string" ? obj.ar : fallback,
  };
}

function asStatus(value: unknown): EngagementStatus {
  if (
    typeof value === "string" &&
    (ENGAGEMENT_STATUSES as readonly string[]).includes(value)
  ) {
    return value as EngagementStatus;
  }
  return "draft";
}

function normalizeRow(raw: Record<string, unknown>): EngagementRow {
  return {
    id: String(raw.id),
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at),
    reference: String(raw.reference ?? ""),
    icon: typeof raw.icon === "string" ? raw.icon : "file-check",
    status: asStatus(raw.status),
    sort_order: Number(raw.sort_order) || 0,
    title: asI18n(raw.title),
    description: asI18n(raw.description),
    published_at:
      typeof raw.published_at === "string" ? raw.published_at : null,
  };
}

export function pickLocale(
  i18n: EngagementI18n,
  locale: EngagementLocale | Locale | string
): string {
  const key = locale as EngagementLocale;
  return i18n[key] || i18n.fr || i18n.en || i18n.ar || "";
}

export function engagementRowToLocalized(
  row: EngagementRow,
  locale: Locale | string
): LocalizedEngagement {
  return {
    id: row.id,
    reference: row.reference,
    icon: row.icon,
    sortOrder: row.sort_order,
    title: pickLocale(row.title, locale),
    description: pickLocale(row.description, locale),
  };
}

function writeToDbPayload(input: EngagementWriteInput) {
  return {
    reference: input.reference,
    icon: input.icon,
    status: input.status,
    sort_order: input.sortOrder,
    title: input.title,
    description: input.description,
    published_at:
      input.status === "published" ? new Date().toISOString() : null,
  };
}

function patchToDbPayload(
  input: EngagementPatchInput,
  current: EngagementRow
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.reference !== undefined) payload.reference = input.reference;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.status !== undefined) {
    payload.status = input.status;
    if (input.status === "published" && !current.published_at) {
      payload.published_at = new Date().toISOString();
    }
  }
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  return payload;
}

export async function listPublishedEngagementRows(): Promise<
  EngagementRow[] | null
> {
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("engagements")
    .select(ENGAGEMENT_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[engagements] list published", error.message);
    return null;
  }

  return (data ?? []).map((row) =>
    normalizeRow(row as Record<string, unknown>)
  );
}

export async function listEngagementsForAdmin(): Promise<
  | { ok: true; configured: boolean; engagements: EngagementRow[] }
  | { ok: false }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: true, configured: false, engagements: [] };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from("engagements")
    .select(ENGAGEMENT_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[engagements] list admin", error.message);
    return { ok: false };
  }

  return {
    ok: true,
    configured: true,
    engagements: (data ?? []).map((row) =>
      normalizeRow(row as Record<string, unknown>)
    ),
  };
}

export async function getEngagementByIdForAdmin(
  id: string
): Promise<EngagementRow | null> {
  if (!UUID_RE.test(id) || !isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("engagements")
    .select(ENGAGEMENT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[engagements] get by id", error.message);
    return null;
  }
  if (!data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export async function createEngagement(
  input: EngagementWriteInput
): Promise<
  | { ok: true; engagement: EngagementRow }
  | { ok: false; reason: "persist_failed" | "duplicate_reference" }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "persist_failed" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "persist_failed" };

  const { data, error } = await supabase
    .from("engagements")
    .insert(writeToDbPayload(input))
    .select(ENGAGEMENT_SELECT)
    .single();

  if (error) {
    console.error("[engagements] create", error.message);
    if (error.code === "23505") {
      return { ok: false, reason: "duplicate_reference" };
    }
    return { ok: false, reason: "persist_failed" };
  }

  return {
    ok: true,
    engagement: normalizeRow(data as Record<string, unknown>),
  };
}

export async function updateEngagement(
  id: string,
  input: EngagementPatchInput
): Promise<
  | { ok: true; engagement: EngagementRow }
  | {
      ok: false;
      reason:
        | "not_found"
        | "invalid_id"
        | "persist_failed"
        | "duplicate_reference";
    }
> {
  if (!UUID_RE.test(id)) return { ok: false, reason: "invalid_id" };
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "persist_failed" };
  }

  const current = await getEngagementByIdForAdmin(id);
  if (!current) return { ok: false, reason: "not_found" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "persist_failed" };

  const { data, error } = await supabase
    .from("engagements")
    .update(patchToDbPayload(input, current))
    .eq("id", id)
    .select(ENGAGEMENT_SELECT)
    .single();

  if (error) {
    console.error("[engagements] update", error.message);
    if (error.code === "23505") {
      return { ok: false, reason: "duplicate_reference" };
    }
    return { ok: false, reason: "persist_failed" };
  }

  return {
    ok: true,
    engagement: normalizeRow(data as Record<string, unknown>),
  };
}

export async function deleteEngagement(
  id: string
): Promise<
  { ok: true } | { ok: false; reason: "not_found" | "invalid_id" | "persist_failed" }
> {
  if (!UUID_RE.test(id)) return { ok: false, reason: "invalid_id" };
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "persist_failed" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "persist_failed" };

  const { data, error } = await supabase
    .from("engagements")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[engagements] delete", error.message);
    return { ok: false, reason: "persist_failed" };
  }
  if (!data) return { ok: false, reason: "not_found" };
  return { ok: true };
}

export async function archiveEngagement(
  id: string
): Promise<
  | { ok: true; engagement: EngagementRow }
  | { ok: false; reason: "not_found" | "invalid_id" | "persist_failed" }
> {
  const result = await updateEngagement(id, { status: "archived" });
  if (result.ok) return result;

  // Archiver ne crée pas de conflit de référence — normaliser le type de retour.
  if (result.reason === "invalid_id" || result.reason === "not_found") {
    return { ok: false, reason: result.reason };
  }
  return { ok: false, reason: "persist_failed" };
}

export async function reorderEngagements(
  orderedIds: string[]
): Promise<{ ok: true } | { ok: false; reason: "persist_failed" }> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "persist_failed" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "persist_failed" };

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    if (!UUID_RE.test(id)) continue;
    const { error } = await supabase
      .from("engagements")
      .update({ sort_order: (i + 1) * 10 })
      .eq("id", id);
    if (error) {
      console.error("[engagements] reorder", error.message);
      return { ok: false, reason: "persist_failed" };
    }
  }
  return { ok: true };
}
