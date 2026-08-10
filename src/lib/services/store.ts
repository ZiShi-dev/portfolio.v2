import type { Locale } from "@/i18n/routing";
import type { ProjectInquiryType } from "@/data/project-inquiry-options";
import {
  type ServiceCurrency,
  type ServiceLocale,
  type ServiceOfferKind,
  type ServicePatchInput,
  type ServicePricingMode,
  type ServiceStatus,
  type ServiceWriteInput,
  SERVICE_CURRENCIES,
  SERVICE_OFFER_KINDS,
  SERVICE_PRICING_MODES,
  SERVICE_STATUSES,
} from "@/lib/services/schema";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

export type ServiceI18n = {
  fr: string;
  en: string;
  ar: string;
};

export type ServiceFeatureStored = ServiceI18n;

export type ServiceRow = {
  id: string;
  created_at: string;
  updated_at: string;
  reference: string;
  slug: string;
  icon: string;
  status: ServiceStatus;
  featured: boolean;
  sort_order: number;
  title: ServiceI18n;
  short_description: ServiceI18n;
  description: ServiceI18n;
  ideal_for: ServiceI18n;
  included_features: ServiceFeatureStored[];
  cta_label: ServiceI18n;
  offer_kind: ServiceOfferKind;
  show_cta_buy: boolean;
  show_cta_start: boolean;
  cover_image: string | null;
  linked_project_id: string | null;
  pricing_mode: ServicePricingMode;
  starting_price_cents: number | null;
  currency: ServiceCurrency;
  inquiry_project_type: ProjectInquiryType | null;
  seo_title: ServiceI18n;
  seo_description: ServiceI18n;
  published_at: string | null;
  case_study_ids: string[];
};

export type LocalizedService = {
  id: string;
  slug: string;
  reference: string;
  icon: string;
  featured: boolean;
  sortOrder: number;
  title: string;
  shortDescription: string;
  description: string;
  idealFor: string;
  includedFeatures: string[];
  ctaLabel: string;
  offerKind: ServiceOfferKind;
  showCtaBuy: boolean;
  showCtaStart: boolean;
  coverImage: string | null;
  linkedProjectId: string | null;
  pricingMode: ServicePricingMode;
  startingPriceCents: number | null;
  currency: ServiceCurrency;
  inquiryProjectType: ProjectInquiryType | null;
  seoTitle?: string;
  seoDescription?: string;
  caseStudyIds: string[];
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SERVICE_SELECT =
  "id, created_at, updated_at, reference, slug, icon, status, featured, sort_order, title, short_description, description, ideal_for, included_features, cta_label, offer_kind, show_cta_buy, show_cta_start, cover_image, linked_project_id, pricing_mode, starting_price_cents, currency, inquiry_project_type, seo_title, seo_description, published_at";

function asI18n(value: unknown, fallback = ""): ServiceI18n {
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

function asFeatures(value: unknown): ServiceFeatureStored[] {
  if (!Array.isArray(value)) return [];
  const features: ServiceFeatureStored[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const i18n = asI18n(item);
    if (!i18n.fr && !i18n.en && !i18n.ar) continue;
    features.push(i18n);
  }
  return features;
}

function asStatus(value: unknown): ServiceStatus {
  if (
    typeof value === "string" &&
    (SERVICE_STATUSES as readonly string[]).includes(value)
  ) {
    return value as ServiceStatus;
  }
  return "draft";
}

function asPricingMode(value: unknown): ServicePricingMode {
  if (
    typeof value === "string" &&
    (SERVICE_PRICING_MODES as readonly string[]).includes(value)
  ) {
    return value as ServicePricingMode;
  }
  return "quote_only";
}

function asOfferKind(value: unknown): ServiceOfferKind {
  if (
    typeof value === "string" &&
    (SERVICE_OFFER_KINDS as readonly string[]).includes(value)
  ) {
    return value as ServiceOfferKind;
  }
  return "service";
}

function asCurrency(value: unknown): ServiceCurrency {
  if (
    typeof value === "string" &&
    (SERVICE_CURRENCIES as readonly string[]).includes(value)
  ) {
    return value as ServiceCurrency;
  }
  return "EUR";
}

function asInquiryType(value: unknown): ProjectInquiryType | null {
  const allowed = [
    "showcase",
    "ecommerce",
    "web_app",
    "saas",
    "redesign",
    "automation",
    "other",
  ];
  if (typeof value === "string" && allowed.includes(value)) {
    return value as ProjectInquiryType;
  }
  return null;
}

function normalizeRow(
  raw: Record<string, unknown>,
  caseStudyIds: string[] = []
): ServiceRow {
  const cents = raw.starting_price_cents;
  return {
    id: String(raw.id),
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at),
    reference: String(raw.reference ?? ""),
    slug: String(raw.slug),
    icon: typeof raw.icon === "string" ? raw.icon : "sparkles",
    status: asStatus(raw.status),
    featured: Boolean(raw.featured),
    sort_order: Number(raw.sort_order) || 0,
    title: asI18n(raw.title),
    short_description: asI18n(raw.short_description),
    description: asI18n(raw.description),
    ideal_for: asI18n(raw.ideal_for),
    included_features: asFeatures(raw.included_features),
    cta_label: asI18n(raw.cta_label),
    offer_kind: asOfferKind(raw.offer_kind),
    show_cta_buy: Boolean(raw.show_cta_buy),
    show_cta_start:
      raw.show_cta_start === undefined || raw.show_cta_start === null
        ? true
        : Boolean(raw.show_cta_start),
    cover_image:
      typeof raw.cover_image === "string" && raw.cover_image.trim()
        ? raw.cover_image.trim()
        : null,
    linked_project_id:
      typeof raw.linked_project_id === "string" &&
      UUID_RE.test(raw.linked_project_id)
        ? raw.linked_project_id
        : null,
    pricing_mode: asPricingMode(raw.pricing_mode),
    starting_price_cents:
      typeof cents === "number" && Number.isFinite(cents)
        ? Math.trunc(cents)
        : null,
    currency: asCurrency(raw.currency),
    inquiry_project_type: asInquiryType(raw.inquiry_project_type),
    seo_title: asI18n(raw.seo_title),
    seo_description: asI18n(raw.seo_description),
    published_at:
      typeof raw.published_at === "string" ? raw.published_at : null,
    case_study_ids: caseStudyIds,
  };
}

export function pickLocale(
  i18n: ServiceI18n,
  locale: ServiceLocale | Locale | string
): string {
  const key = locale as ServiceLocale;
  return i18n[key] || i18n.fr || i18n.en || i18n.ar || "";
}

export function serviceRowToLocalized(
  row: ServiceRow,
  locale: Locale | string
): LocalizedService {
  return {
    id: row.id,
    slug: row.slug,
    reference: row.reference,
    icon: row.icon,
    featured: row.featured,
    sortOrder: row.sort_order,
    title: pickLocale(row.title, locale),
    shortDescription: pickLocale(row.short_description, locale),
    description: pickLocale(row.description, locale),
    idealFor: pickLocale(row.ideal_for, locale),
    includedFeatures: row.included_features
      .map((f) => pickLocale(f, locale))
      .filter(Boolean),
    ctaLabel: pickLocale(row.cta_label, locale),
    offerKind: row.offer_kind,
    showCtaBuy: row.show_cta_buy,
    showCtaStart: row.show_cta_start,
    coverImage: row.cover_image,
    linkedProjectId: row.linked_project_id,
    pricingMode: row.pricing_mode,
    startingPriceCents: row.starting_price_cents,
    currency: row.currency,
    inquiryProjectType: row.inquiry_project_type,
    seoTitle: pickLocale(row.seo_title, locale) || undefined,
    seoDescription: pickLocale(row.seo_description, locale) || undefined,
    caseStudyIds: row.case_study_ids,
  };
}

async function loadCaseStudyIds(
  serviceIds: string[]
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (serviceIds.length === 0) return map;
  if (!isSupabaseServiceConfigured()) return map;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("service_case_studies")
    .select("service_id, project_id, sort_order")
    .in("service_id", serviceIds)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[services] case studies", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const sid = String(row.service_id);
    const pid = String(row.project_id);
    const list = map.get(sid) ?? [];
    list.push(pid);
    map.set(sid, list);
  }
  return map;
}

async function replaceCaseStudies(
  serviceId: string,
  projectIds: string[]
): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return false;

  const { error: delError } = await supabase
    .from("service_case_studies")
    .delete()
    .eq("service_id", serviceId);

  if (delError) {
    console.error("[services] clear case studies", delError.message);
    return false;
  }

  if (projectIds.length === 0) return true;

  const rows = projectIds.map((project_id, index) => ({
    service_id: serviceId,
    project_id,
    sort_order: (index + 1) * 10,
  }));

  const { error: insError } = await supabase
    .from("service_case_studies")
    .insert(rows);

  if (insError) {
    console.error("[services] insert case studies", insError.message);
    return false;
  }
  return true;
}

function writeToDbPayload(input: ServiceWriteInput) {
  const startingCents =
    input.pricingMode === "starting_at" || input.pricingMode === "fixed"
      ? input.startingPriceCents
      : null;

  return {
    reference: input.reference,
    slug: input.slug,
    icon: input.icon,
    status: input.status,
    featured: input.featured,
    sort_order: input.sortOrder,
    title: input.title,
    short_description: input.shortDescription,
    description: input.description,
    ideal_for: input.idealFor,
    included_features: input.includedFeatures,
    cta_label: input.ctaLabel,
    offer_kind: input.offerKind,
    show_cta_buy: input.showCtaBuy,
    show_cta_start: input.showCtaStart,
    cover_image: input.coverImage ?? null,
    linked_project_id: input.linkedProjectId ?? null,
    pricing_mode: input.pricingMode,
    starting_price_cents: startingCents,
    currency: input.currency,
    inquiry_project_type: input.inquiryProjectType,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  };
}

function patchToDbPayload(
  input: ServicePatchInput,
  current: ServiceRow
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (input.reference !== undefined) payload.reference = input.reference;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.status !== undefined) {
    payload.status = input.status;
    if (input.status === "published" && !current.published_at) {
      payload.published_at = new Date().toISOString();
    }
    if (input.status !== "published" && current.status === "published") {
      // conserve published_at historique
    }
  }
  if (input.featured !== undefined) payload.featured = input.featured;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.title !== undefined) payload.title = input.title;
  if (input.shortDescription !== undefined) {
    payload.short_description = input.shortDescription;
  }
  if (input.description !== undefined) payload.description = input.description;
  if (input.idealFor !== undefined) payload.ideal_for = input.idealFor;
  if (input.includedFeatures !== undefined) {
    payload.included_features = input.includedFeatures;
  }
  if (input.ctaLabel !== undefined) payload.cta_label = input.ctaLabel;
  if (input.offerKind !== undefined) payload.offer_kind = input.offerKind;
  if (input.showCtaBuy !== undefined) payload.show_cta_buy = input.showCtaBuy;
  if (input.showCtaStart !== undefined) {
    payload.show_cta_start = input.showCtaStart;
  }
  if (input.coverImage !== undefined) payload.cover_image = input.coverImage;
  if (input.linkedProjectId !== undefined) {
    payload.linked_project_id = input.linkedProjectId;
  }
  if (input.pricingMode !== undefined) payload.pricing_mode = input.pricingMode;
  if (input.currency !== undefined) payload.currency = input.currency;
  if (input.inquiryProjectType !== undefined) {
    payload.inquiry_project_type = input.inquiryProjectType;
  }
  if (input.seoTitle !== undefined) payload.seo_title = input.seoTitle;
  if (input.seoDescription !== undefined) {
    payload.seo_description = input.seoDescription;
  }

  const nextMode = (input.pricingMode ?? current.pricing_mode) as ServicePricingMode;
  if (input.startingPriceCents !== undefined || input.pricingMode !== undefined) {
    if (nextMode === "starting_at" || nextMode === "fixed") {
      payload.starting_price_cents =
        input.startingPriceCents !== undefined
          ? input.startingPriceCents
          : current.starting_price_cents;
    } else {
      payload.starting_price_cents = null;
    }
  }

  return payload;
}

export async function listPublishedServiceRows(): Promise<ServiceRow[] | null> {
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[services] list published", error.message);
    return null;
  }

  const rows = (data ?? []).map((row) =>
    normalizeRow(row as Record<string, unknown>)
  );
  const caseMap = await loadCaseStudyIds(rows.map((r) => r.id));
  return rows.map((r) => ({
    ...r,
    case_study_ids: caseMap.get(r.id) ?? [],
  }));
}

export async function getPublishedServiceBySlug(
  slug: string
): Promise<ServiceRow | null> {
  if (!slug || slug.length < 2) return null;
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[services] get by slug", error.message);
    return null;
  }
  if (!data) return null;

  const row = normalizeRow(data as Record<string, unknown>);
  const caseMap = await loadCaseStudyIds([row.id]);
  return { ...row, case_study_ids: caseMap.get(row.id) ?? [] };
}

export async function getServiceByIdForAdmin(
  id: string
): Promise<ServiceRow | null> {
  if (!UUID_RE.test(id)) return null;
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const row = normalizeRow(data as Record<string, unknown>);
  const caseMap = await loadCaseStudyIds([row.id]);
  return { ...row, case_study_ids: caseMap.get(row.id) ?? [] };
}

/** Preview admin : n’importe quel statut, jamais exposé publiquement sans auth. */
export async function getServiceBySlugForAdmin(
  slug: string
): Promise<ServiceRow | null> {
  if (!slug || slug.length < 2) return null;
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const row = normalizeRow(data as Record<string, unknown>);
  const caseMap = await loadCaseStudyIds([row.id]);
  return { ...row, case_study_ids: caseMap.get(row.id) ?? [] };
}

export async function listPublishedServiceSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  if (!isSupabaseServiceConfigured()) return [];
  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("services")
    .select("slug, updated_at")
    .eq("status", "published");

  if (error) {
    console.error("[services] list slugs", error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    slug: String(row.slug),
    updated_at: String(row.updated_at),
  }));
}

export async function listServicesForAdmin(limit = 100): Promise<
  | { ok: true; configured: true; services: ServiceRow[] }
  | { ok: true; configured: false; services: [] }
  | { ok: false; reason: "persist_failed" }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: true, configured: false, services: [] };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { ok: true, configured: false, services: [] };
  }

  const safeLimit = Math.min(Math.max(1, limit), 200);
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("[services] list admin", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  const rows = (data ?? []).map((row) =>
    normalizeRow(row as Record<string, unknown>)
  );
  const caseMap = await loadCaseStudyIds(rows.map((r) => r.id));

  return {
    ok: true,
    configured: true,
    services: rows.map((r) => ({
      ...r,
      case_study_ids: caseMap.get(r.id) ?? [],
    })),
  };
}

export async function createService(
  input: ServiceWriteInput
): Promise<
  | { ok: true; service: ServiceRow }
  | {
      ok: false;
      reason: "persist_failed" | "duplicate_slug" | "duplicate_reference";
    }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "persist_failed" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "persist_failed" };

  const payload = writeToDbPayload(input);
  const { data, error } = await supabase
    .from("services")
    .insert(payload)
    .select(SERVICE_SELECT)
    .single();

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("services_slug") || msg.includes("(slug)")) {
      return { ok: false, reason: "duplicate_slug" };
    }
    if (msg.includes("services_reference") || msg.includes("(reference)")) {
      return { ok: false, reason: "duplicate_reference" };
    }
    console.error("[services] create", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  const row = normalizeRow(data as Record<string, unknown>);
  const linked = await replaceCaseStudies(row.id, input.caseStudyIds);
  if (!linked) {
    console.error("[services] create case studies failed");
  }

  return {
    ok: true,
    service: { ...row, case_study_ids: input.caseStudyIds },
  };
}

export async function updateService(
  id: string,
  input: ServicePatchInput
): Promise<
  | { ok: true; service: ServiceRow }
  | {
      ok: false;
      reason:
        | "persist_failed"
        | "invalid_id"
        | "not_found"
        | "duplicate_slug"
        | "duplicate_reference"
        | "publish_incomplete";
    }
> {
  if (!UUID_RE.test(id)) return { ok: false, reason: "invalid_id" };
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "persist_failed" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "persist_failed" };

  const current = await getServiceByIdForAdmin(id);
  if (!current) return { ok: false, reason: "not_found" };

  // Validation publication merge
  if (input.status === "published") {
    const title = input.title ?? current.title;
    const short = input.shortDescription ?? current.short_description;
    if (!title.fr?.trim() || !short.fr?.trim()) {
      return { ok: false, reason: "publish_incomplete" };
    }
    const mode = input.pricingMode ?? current.pricing_mode;
    const cents =
      input.startingPriceCents !== undefined
        ? input.startingPriceCents
        : current.starting_price_cents;
    if (mode === "starting_at" && (cents === null || cents < 0)) {
      return { ok: false, reason: "publish_incomplete" };
    }
  }

  const payload = patchToDbPayload(input, current);
  if (Object.keys(payload).length === 0 && input.caseStudyIds === undefined) {
    return { ok: true, service: current };
  }

  let row = current;
  if (Object.keys(payload).length > 0) {
    const { data, error } = await supabase
      .from("services")
      .update(payload)
      .eq("id", id)
      .select(SERVICE_SELECT)
      .single();

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("services_slug") || msg.includes("(slug)")) {
        return { ok: false, reason: "duplicate_slug" };
      }
      if (msg.includes("services_reference") || msg.includes("(reference)")) {
        return { ok: false, reason: "duplicate_reference" };
      }
      console.error("[services] update", error.message);
      return { ok: false, reason: "persist_failed" };
    }
    row = normalizeRow(data as Record<string, unknown>);
  }

  let caseIds = current.case_study_ids;
  if (input.caseStudyIds !== undefined) {
    // Filtrer les IDs invalides pour éviter un 503 sur FK cassée
    const validIds = input.caseStudyIds.filter((pid) => UUID_RE.test(pid));
    const linked = await replaceCaseStudies(id, validIds);
    if (!linked) {
      console.error("[services] case studies link failed after update", id);
      // L’offre est déjà à jour — renvoyer le row sans faire échouer tout le PATCH
      return { ok: true, service: { ...row, case_study_ids: validIds } };
    }
    caseIds = validIds;
  } else {
    const caseMap = await loadCaseStudyIds([id]);
    caseIds = caseMap.get(id) ?? [];
  }

  return { ok: true, service: { ...row, case_study_ids: caseIds } };
}

export async function duplicateService(
  id: string
): Promise<
  | { ok: true; service: ServiceRow }
  | {
      ok: false;
      reason:
        | "persist_failed"
        | "invalid_id"
        | "not_found"
        | "duplicate_slug"
        | "duplicate_reference";
    }
> {
  const source = await getServiceByIdForAdmin(id);
  if (!source) {
    return {
      ok: false,
      reason: UUID_RE.test(id) ? "not_found" : "invalid_id",
    };
  }

  const stamp = Date.now().toString(36).slice(-5);
  const baseRef = source.reference.replace(/-COPY.*$/i, "").slice(0, 24);
  const draft: ServiceWriteInput = {
    reference: `${baseRef}-${stamp}`.slice(0, 32),
    slug: `${source.slug}-copy-${stamp}`.slice(0, 80),
    icon: source.icon,
    status: "draft",
    featured: false,
    sortOrder: source.sort_order + 1,
    title: { ...source.title },
    shortDescription: { ...source.short_description },
    description: { ...source.description },
    idealFor: { ...source.ideal_for },
    includedFeatures: source.included_features.map((f) => ({ ...f })),
    ctaLabel: { ...source.cta_label },
    offerKind: source.offer_kind,
    showCtaBuy: source.show_cta_buy,
    showCtaStart: source.show_cta_start,
    coverImage: source.cover_image,
    linkedProjectId: source.linked_project_id,
    pricingMode: source.pricing_mode,
    startingPriceCents: source.starting_price_cents,
    currency: source.currency,
    inquiryProjectType: source.inquiry_project_type,
    caseStudyIds: [...source.case_study_ids],
    seoTitle: { ...source.seo_title },
    seoDescription: { ...source.seo_description },
  };

  return createService(draft);
}

export async function reorderServices(
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
      .from("services")
      .update({ sort_order: (i + 1) * 10 })
      .eq("id", id);
    if (error) {
      console.error("[services] reorder", error.message);
      return { ok: false, reason: "persist_failed" };
    }
  }
  return { ok: true };
}

export async function archiveService(
  id: string
): Promise<
  | { ok: true; service: ServiceRow }
  | {
      ok: false;
      reason:
        | "persist_failed"
        | "invalid_id"
        | "not_found"
        | "duplicate_slug"
        | "duplicate_reference"
        | "publish_incomplete";
    }
> {
  return updateService(id, { status: "archived" });
}

export async function deleteService(id: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;
  if (!isSupabaseServiceConfigured()) return false;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return false;

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    console.error("[services] delete", error.message);
    return false;
  }
  return true;
}

export function countServices(services: ServiceRow[]): number {
  return services.length;
}
