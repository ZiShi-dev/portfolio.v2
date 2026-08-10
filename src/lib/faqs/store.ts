import type { Locale } from "@/i18n/routing";
import {
  type FaqLocale,
  type FaqPatchInput,
  type FaqScope,
  type FaqStatus,
  type FaqWriteInput,
  FAQ_SCOPES,
  FAQ_STATUSES,
} from "@/lib/faqs/schema";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

export type FaqI18n = {
  fr: string;
  en: string;
  ar: string;
};

export type FaqRow = {
  id: string;
  created_at: string;
  updated_at: string;
  reference: string;
  status: FaqStatus;
  featured: boolean;
  sort_order: number;
  scope: FaqScope;
  question: FaqI18n;
  answer: FaqI18n;
  published_at: string | null;
  service_ids: string[];
};

export type LocalizedFaq = {
  id: string;
  reference: string;
  featured: boolean;
  sortOrder: number;
  scope: FaqScope;
  question: string;
  answer: string;
  serviceIds: string[];
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FAQ_SELECT =
  "id, created_at, updated_at, reference, status, featured, sort_order, scope, question, answer, published_at";

function asI18n(value: unknown, fallback = ""): FaqI18n {
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

function asStatus(value: unknown): FaqStatus {
  if (
    typeof value === "string" &&
    (FAQ_STATUSES as readonly string[]).includes(value)
  ) {
    return value as FaqStatus;
  }
  return "draft";
}

function asScope(value: unknown): FaqScope {
  if (
    typeof value === "string" &&
    (FAQ_SCOPES as readonly string[]).includes(value)
  ) {
    return value as FaqScope;
  }
  return "general";
}

function normalizeRow(
  raw: Record<string, unknown>,
  serviceIds: string[] = []
): FaqRow {
  return {
    id: String(raw.id),
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at),
    reference: String(raw.reference ?? ""),
    status: asStatus(raw.status),
    featured: Boolean(raw.featured),
    sort_order: Number(raw.sort_order) || 0,
    scope: asScope(raw.scope),
    question: asI18n(raw.question),
    answer: asI18n(raw.answer),
    published_at:
      typeof raw.published_at === "string" ? raw.published_at : null,
    service_ids: serviceIds,
  };
}

export function pickLocale(
  i18n: FaqI18n,
  locale: FaqLocale | Locale | string
): string {
  const key = locale as FaqLocale;
  return i18n[key] || i18n.fr || i18n.en || i18n.ar || "";
}

export function faqRowToLocalized(
  row: FaqRow,
  locale: Locale | string
): LocalizedFaq {
  return {
    id: row.id,
    reference: row.reference,
    featured: row.featured,
    sortOrder: row.sort_order,
    scope: row.scope,
    question: pickLocale(row.question, locale),
    answer: pickLocale(row.answer, locale),
    serviceIds: row.service_ids,
  };
}

async function loadServiceIds(faqIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (faqIds.length === 0) return map;
  if (!isSupabaseServiceConfigured()) return map;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("faq_services")
    .select("faq_id, service_id, sort_order")
    .in("faq_id", faqIds)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[faqs] load services", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const faqId = String((row as { faq_id: string }).faq_id);
    const serviceId = String((row as { service_id: string }).service_id);
    const list = map.get(faqId) ?? [];
    list.push(serviceId);
    map.set(faqId, list);
  }
  return map;
}

async function replaceServices(
  faqId: string,
  serviceIds: string[]
): Promise<boolean> {
  if (!UUID_RE.test(faqId)) return false;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return false;

  const { error: delError } = await supabase
    .from("faq_services")
    .delete()
    .eq("faq_id", faqId);
  if (delError) {
    console.error("[faqs] clear services", delError.message);
    return false;
  }

  if (serviceIds.length === 0) return true;

  const rows = serviceIds.map((service_id, index) => ({
    faq_id: faqId,
    service_id,
    sort_order: (index + 1) * 10,
  }));

  const { error: insError } = await supabase.from("faq_services").insert(rows);
  if (insError) {
    console.error("[faqs] insert services", insError.message);
    return false;
  }
  return true;
}

function writeToDbPayload(input: FaqWriteInput) {
  return {
    reference: input.reference,
    status: input.status,
    featured: input.featured,
    sort_order: input.sortOrder,
    scope: input.scope,
    question: input.question,
    answer: input.answer,
    published_at:
      input.status === "published" ? new Date().toISOString() : null,
  };
}

function patchToDbPayload(
  input: FaqPatchInput,
  current: FaqRow
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.reference !== undefined) payload.reference = input.reference;
  if (input.status !== undefined) {
    payload.status = input.status;
    if (input.status === "published" && !current.published_at) {
      payload.published_at = new Date().toISOString();
    }
  }
  if (input.featured !== undefined) payload.featured = input.featured;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.scope !== undefined) payload.scope = input.scope;
  if (input.question !== undefined) payload.question = input.question;
  if (input.answer !== undefined) payload.answer = input.answer;
  return payload;
}

export async function listPublishedGeneralFaqRows(): Promise<FaqRow[] | null> {
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("faqs")
    .select(FAQ_SELECT)
    .eq("status", "published")
    .eq("scope", "general")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[faqs] list published general", error.message);
    return null;
  }

  const rows = (data ?? []).map((row) =>
    normalizeRow(row as Record<string, unknown>)
  );
  const serviceMap = await loadServiceIds(rows.map((r) => r.id));
  return rows.map((r) => ({
    ...r,
    service_ids: serviceMap.get(r.id) ?? [],
  }));
}

/** FAQ publiées liées à un service (+ générales liées à ce service). */
export async function listPublishedFaqRowsForService(
  serviceId: string
): Promise<FaqRow[] | null> {
  if (!UUID_RE.test(serviceId)) return [];
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data: links, error: linkError } = await supabase
    .from("faq_services")
    .select("faq_id, sort_order")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });

  if (linkError) {
    console.error("[faqs] list by service links", linkError.message);
    return null;
  }

  const faqIds = (links ?? []).map((l) =>
    String((l as { faq_id: string }).faq_id)
  );
  if (faqIds.length === 0) return [];

  const { data, error } = await supabase
    .from("faqs")
    .select(FAQ_SELECT)
    .eq("status", "published")
    .in("id", faqIds);

  if (error) {
    console.error("[faqs] list by service", error.message);
    return null;
  }

  const byId = new Map(
    (data ?? []).map((row) => {
      const normalized = normalizeRow(row as Record<string, unknown>);
      return [normalized.id, normalized] as const;
    })
  );

  const ordered: FaqRow[] = [];
  for (const id of faqIds) {
    const row = byId.get(id);
    if (row) ordered.push({ ...row, service_ids: [serviceId] });
  }
  return ordered;
}

export async function listFaqsForAdmin(): Promise<
  | { ok: true; configured: boolean; faqs: FaqRow[] }
  | { ok: false }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: true, configured: false, faqs: [] };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from("faqs")
    .select(FAQ_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[faqs] list admin", error.message);
    return { ok: false };
  }

  const rows = (data ?? []).map((row) =>
    normalizeRow(row as Record<string, unknown>)
  );
  const serviceMap = await loadServiceIds(rows.map((r) => r.id));
  return {
    ok: true,
    configured: true,
    faqs: rows.map((r) => ({
      ...r,
      service_ids: serviceMap.get(r.id) ?? [],
    })),
  };
}

export async function getFaqByIdForAdmin(id: string): Promise<FaqRow | null> {
  if (!UUID_RE.test(id) || !isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("faqs")
    .select(FAQ_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const row = normalizeRow(data as Record<string, unknown>);
  const serviceMap = await loadServiceIds([row.id]);
  return { ...row, service_ids: serviceMap.get(row.id) ?? [] };
}

export async function createFaq(
  input: FaqWriteInput
): Promise<
  | { ok: true; faq: FaqRow }
  | { ok: false; reason: "not_configured" | "duplicate_reference" }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const { data, error } = await supabase
    .from("faqs")
    .insert(writeToDbPayload(input))
    .select(FAQ_SELECT)
    .single();

  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      return { ok: false, reason: "duplicate_reference" };
    }
    console.error("[faqs] create", error.message);
    return { ok: false, reason: "not_configured" };
  }

  const row = normalizeRow(data as Record<string, unknown>);
  await replaceServices(row.id, input.serviceIds);
  return { ok: true, faq: { ...row, service_ids: [...input.serviceIds] } };
}

export async function updateFaq(
  id: string,
  input: FaqPatchInput
): Promise<
  | { ok: true; faq: FaqRow }
  | {
      ok: false;
      reason:
        | "invalid_id"
        | "not_found"
        | "not_configured"
        | "duplicate_reference"
        | "publish_requires_question"
        | "publish_requires_answer";
    }
> {
  if (!UUID_RE.test(id)) return { ok: false, reason: "invalid_id" };
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const current = await getFaqByIdForAdmin(id);
  if (!current) return { ok: false, reason: "not_found" };

  const nextStatus = input.status ?? current.status;
  if (nextStatus === "published") {
    const question = input.question ?? current.question;
    const answer = input.answer ?? current.answer;
    if (!question.fr?.trim()) {
      return { ok: false, reason: "publish_requires_question" };
    }
    if (!answer.fr?.trim()) {
      return { ok: false, reason: "publish_requires_answer" };
    }
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const payload = patchToDbPayload(input, current);
  if (Object.keys(payload).length > 0) {
    const { data, error } = await supabase
      .from("faqs")
      .update(payload)
      .eq("id", id)
      .select(FAQ_SELECT)
      .single();

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        return { ok: false, reason: "duplicate_reference" };
      }
      console.error("[faqs] update", error.message);
      return { ok: false, reason: "not_configured" };
    }

    const row = normalizeRow(data as Record<string, unknown>);
    if (input.serviceIds !== undefined) {
      await replaceServices(id, input.serviceIds);
      return { ok: true, faq: { ...row, service_ids: [...input.serviceIds] } };
    }
    return {
      ok: true,
      faq: { ...row, service_ids: current.service_ids },
    };
  }

  if (input.serviceIds !== undefined) {
    await replaceServices(id, input.serviceIds);
    return {
      ok: true,
      faq: { ...current, service_ids: [...input.serviceIds] },
    };
  }

  return { ok: true, faq: current };
}

export async function deleteFaq(
  id: string
): Promise<
  | { ok: true }
  | { ok: false; reason: "invalid_id" | "not_found" | "not_configured" }
> {
  if (!UUID_RE.test(id)) return { ok: false, reason: "invalid_id" };
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const { data, error } = await supabase
    .from("faqs")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[faqs] delete", error.message);
    return { ok: false, reason: "not_configured" };
  }
  if (!data) return { ok: false, reason: "not_found" };
  return { ok: true };
}

export async function reorderFaqs(
  orderedIds: string[]
): Promise<{ ok: true } | { ok: false }> {
  if (!isSupabaseServiceConfigured()) return { ok: false };
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false };

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    if (!id || !UUID_RE.test(id)) continue;
    const { error } = await supabase
      .from("faqs")
      .update({ sort_order: (i + 1) * 10 })
      .eq("id", id);
    if (error) {
      console.error("[faqs] reorder", error.message);
      return { ok: false };
    }
  }
  return { ok: true };
}

export async function duplicateFaq(
  id: string
): Promise<
  | { ok: true; faq: FaqRow }
  | {
      ok: false;
      reason: "invalid_id" | "not_found" | "not_configured" | "duplicate_reference";
    }
> {
  const source = await getFaqByIdForAdmin(id);
  if (!source) {
    return {
      ok: false,
      reason: UUID_RE.test(id) ? "not_found" : "invalid_id",
    };
  }

  const stamp = Date.now().toString(36).slice(-5);
  const baseRef = source.reference.replace(/-COPY.*$/i, "").slice(0, 24);
  const draft: FaqWriteInput = {
    reference: `${baseRef}-${stamp}`.slice(0, 32),
    status: "draft",
    featured: false,
    sortOrder: source.sort_order + 1,
    scope: source.scope,
    question: { ...source.question },
    answer: { ...source.answer },
    serviceIds: [...source.service_ids],
  };

  return createFaq(draft);
}
