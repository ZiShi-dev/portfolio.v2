import type { Locale } from "@/i18n/routing";
import {
  projectCatalog,
  type LocalizedProjectItem,
  type ProjectCategoryKey,
} from "@/data/projects";
import {
  formatCaseReference,
  parseCaseReferenceNumber,
  type ProjectKind,
  type ProjectLocale,
  type ProjectPatchInput,
  type ProjectWriteInput,
  type SaleCtaMode,
} from "@/lib/projects/schema";
import { formatServicePrice } from "@/lib/services/pricing";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

export type ProjectI18n = {
  fr: string;
  en: string;
  ar: string;
};

export type ProjectImageStored = {
  url: string;
  label?: Partial<ProjectI18n>;
};

export type ProjectFeatureStored = ProjectI18n;

export type ProjectRow = {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  reference: string | null;
  title: ProjectI18n;
  description: ProjectI18n;
  kind: ProjectKind;
  business_type_ids: string[];
  images: ProjectImageStored[];
  cover_image: string | null;
  link: string | null;
  app_link: string | null;
  sort_order: number;
  published: boolean;
  featured: boolean;
  published_at: string | null;
  technologies: string[];
  features: ProjectFeatureStored[];
  client_need: ProjectI18n;
  objective: ProjectI18n;
  solution: ProjectI18n;
  result: ProjectI18n;
  seo_title: ProjectI18n;
  seo_description: ProjectI18n;
  listing_price_cents: number | null;
  listing_intent: ProjectI18n;
  sale_cta_mode: SaleCtaMode;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PROJECT_SELECT =
  "id, created_at, updated_at, slug, reference, title, description, kind, business_type_ids, images, cover_image, link, app_link, sort_order, published, featured, published_at, technologies, features, client_need, objective, solution, result, seo_title, seo_description, listing_price_cents, listing_intent, sale_cta_mode";

function asKind(value: unknown): ProjectKind {
  if (value === "sold" || value === "for_sale" || value === "personal") {
    return value;
  }
  return "personal";
}

function asSaleCtaMode(value: unknown): SaleCtaMode {
  if (value === "contacts" || value === "inquiry") return value;
  return "inquiry";
}

function asCents(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.round(value);
}

function asI18n(value: unknown, fallback = ""): ProjectI18n {
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

function asImages(value: unknown): ProjectImageStored[] {
  if (!Array.isArray(value)) return [];
  const images: ProjectImageStored[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.url !== "string" || !row.url) continue;
    images.push({
      url: row.url,
      label:
        row.label && typeof row.label === "object"
          ? asI18n(row.label, "")
          : undefined,
    });
  }
  return images;
}

function asFeatures(value: unknown): ProjectFeatureStored[] {
  if (!Array.isArray(value)) return [];
  const features: ProjectFeatureStored[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const i18n = asI18n(item);
    if (!i18n.fr && !i18n.en && !i18n.ar) continue;
    features.push(i18n);
  }
  return features;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((t): t is string => typeof t === "string" && t.trim() !== "");
}

function normalizeRow(raw: Record<string, unknown>): ProjectRow {
  return {
    id: String(raw.id),
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at),
    slug: String(raw.slug),
    reference: typeof raw.reference === "string" ? raw.reference : null,
    title: asI18n(raw.title),
    description: asI18n(raw.description),
    kind: asKind(raw.kind),
    business_type_ids: Array.isArray(raw.business_type_ids)
      ? raw.business_type_ids.filter((t): t is string => typeof t === "string")
      : [],
    images: asImages(raw.images),
    cover_image: typeof raw.cover_image === "string" ? raw.cover_image : null,
    link: typeof raw.link === "string" ? raw.link : null,
    app_link: typeof raw.app_link === "string" ? raw.app_link : null,
    sort_order: Number(raw.sort_order) || 0,
    published: Boolean(raw.published),
    featured: Boolean(raw.featured),
    published_at:
      typeof raw.published_at === "string" ? raw.published_at : null,
    technologies: asStringArray(raw.technologies),
    features: asFeatures(raw.features),
    client_need: asI18n(raw.client_need),
    objective: asI18n(raw.objective),
    solution: asI18n(raw.solution),
    result: asI18n(raw.result),
    seo_title: asI18n(raw.seo_title),
    seo_description: asI18n(raw.seo_description),
    listing_price_cents: asCents(raw.listing_price_cents),
    listing_intent: asI18n(raw.listing_intent),
    sale_cta_mode: asSaleCtaMode(raw.sale_cta_mode),
  };
}

function pickLocale(
  i18n: ProjectI18n,
  locale: ProjectLocale | Locale
): string {
  const key = locale as ProjectLocale;
  return i18n[key] || i18n.fr || i18n.en || i18n.ar || "";
}

/**
 * Couverture publique = 1ʳᵉ image de galerie.
 * Ignore un `cover_image` orphelin (URL absente de la galerie après remplacement).
 */
export function projectCoverUrl(row: ProjectRow): string | undefined {
  const galleryUrls = row.images.map((img) => img.url).filter(Boolean);
  if (row.cover_image && galleryUrls.includes(row.cover_image)) {
    return row.cover_image;
  }
  return galleryUrls[0];
}

function comparePublishedRows(a: ProjectRow, b: ProjectRow): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
  return Date.parse(b.created_at) - Date.parse(a.created_at);
}

export function projectRowToLocalized(
  row: ProjectRow,
  locale: Locale,
  categoryLabel: string
): LocalizedProjectItem {
  const gallery = row.images.map((img) => ({
    src: img.url,
    label: img.label
      ? pickLocale(
          {
            fr: img.label.fr ?? "",
            en: img.label.en ?? "",
            ar: img.label.ar ?? "",
          },
          locale
        ) || undefined
      : undefined,
  }));

  const coverUrl = projectCoverUrl(row);
  let images = gallery;
  if (coverUrl) {
    const coverIndex = gallery.findIndex((img) => img.src === coverUrl);
    if (coverIndex > 0) {
      images = [
        gallery[coverIndex]!,
        ...gallery.filter((_, index) => index !== coverIndex),
      ];
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    reference: row.reference ?? undefined,
    featured: row.featured,
    categoryKey: row.kind as ProjectCategoryKey,
    title: pickLocale(row.title, locale),
    category: categoryLabel,
    desc: pickLocale(row.description, locale),
    // tags = stack technique uniquement (les types métier passent par businessTypeIds + i18n).
    tags: row.technologies,
    businessTypeIds: row.business_type_ids,
    technologies: row.technologies,
    images,
    link: row.link ?? undefined,
    appLink: row.app_link ?? undefined,
    clientNeed: pickLocale(row.client_need, locale) || undefined,
    objective: pickLocale(row.objective, locale) || undefined,
    solution: pickLocale(row.solution, locale) || undefined,
    result: pickLocale(row.result, locale) || undefined,
    features: row.features
      .map((f) => pickLocale(f, locale))
      .filter(Boolean),
    seoTitle: pickLocale(row.seo_title, locale) || undefined,
    seoDescription: pickLocale(row.seo_description, locale) || undefined,
    listingPriceCents: row.listing_price_cents,
    listingPriceLabel:
      row.listing_price_cents !== null
        ? formatServicePrice(row.listing_price_cents, "EUR", locale)
        : undefined,
    listingIntent:
      row.kind === "for_sale" || row.kind === "sold"
        ? pickLocale(row.listing_intent, locale) || undefined
        : undefined,
    saleCtaMode: row.kind === "for_sale" ? row.sale_cta_mode : undefined,
  };
}

/** Sélection publique. Si BDD vide / absente → null (caller fallback démo). */
export async function listPublishedProjectRows(): Promise<ProjectRow[] | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[projects] list published", error.message);
    return null;
  }

  return (data ?? [])
    .map((row) => normalizeRow(row as Record<string, unknown>))
    .sort(comparePublishedRows);
}

export async function getPublishedProjectBySlug(
  slug: string
): Promise<ProjectRow | null> {
  if (!slug || slug.length < 2) return null;
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("[projects] get by slug", error.message);
    return null;
  }
  if (!data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export async function listPublishedProjectSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  if (!isSupabaseServiceConfigured()) return [];
  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("published", true);

  if (error) {
    console.error("[projects] list slugs", error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    slug: String(row.slug),
    updated_at: String(row.updated_at),
  }));
}

export async function getPublishedProjects(
  locale: Locale,
  categoryLabels: Record<ProjectCategoryKey, string>
): Promise<LocalizedProjectItem[]> {
  const rows = await listPublishedProjectRows();
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows
    .filter((row) => row.images.length > 0 || row.cover_image)
    .map((row) =>
      projectRowToLocalized(
        row,
        locale,
        categoryLabels[row.kind] ?? row.kind
      )
    );
}

export async function listProjectsForAdmin(limit = 100): Promise<
  | { ok: true; configured: true; projects: ProjectRow[] }
  | { ok: true; configured: false; projects: [] }
  | { ok: false; reason: "persist_failed" }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: true, configured: false, projects: [] };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { ok: true, configured: false, projects: [] };
  }

  const safeLimit = Math.min(Math.max(1, limit), 200);
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("[projects] list admin", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  return {
    ok: true,
    configured: true,
    projects: (data ?? []).map((row) =>
      normalizeRow(row as Record<string, unknown>)
    ),
  };
}

export async function allocateNextCaseReference(): Promise<string> {
  if (!isSupabaseServiceConfigured()) {
    return formatCaseReference(1);
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return formatCaseReference(1);

  const { data, error } = await supabase
    .from("projects")
    .select("reference")
    .not("reference", "is", null)
    .limit(500);

  if (error) {
    console.error("[projects] allocate reference", error.message);
    return formatCaseReference(1);
  }

  let max = 0;
  for (const row of data ?? []) {
    const n = parseCaseReferenceNumber(
      typeof row.reference === "string" ? row.reference : null
    );
    if (n !== null && n > max) max = n;
  }
  return formatCaseReference(max + 1);
}

function writeToDbPayload(
  values: ProjectWriteInput | ProjectPatchInput,
  opts?: { wasPublished?: boolean }
) {
  const payload: Record<string, unknown> = {};
  if (values.slug !== undefined) payload.slug = values.slug;
  if (values.title !== undefined) payload.title = values.title;
  if (values.description !== undefined) payload.description = values.description;
  if (values.kind !== undefined) payload.kind = values.kind;
  if (values.listingPriceCents !== undefined) {
    payload.listing_price_cents = values.listingPriceCents;
  }
  if (values.listingIntent !== undefined) {
    payload.listing_intent = values.listingIntent;
  }
  if (values.saleCtaMode !== undefined) {
    payload.sale_cta_mode = values.saleCtaMode;
  }
  if (values.kind === "personal") {
    payload.listing_price_cents = null;
    payload.listing_intent = { fr: "", en: "", ar: "" };
    payload.sale_cta_mode = "inquiry";
  }
  if (values.businessTypeIds !== undefined) {
    payload.business_type_ids = values.businessTypeIds;
  }
  if (values.images !== undefined) {
    payload.images = values.images.map((img) => ({
      url: img.url,
      ...(img.label ? { label: img.label } : {}),
    }));
    // Garde cover_image alignée sur la galerie (évite une couverture orpheline).
    if (values.coverImage === undefined) {
      payload.cover_image = values.images[0]?.url ?? null;
    }
  }
  if (values.link !== undefined) payload.link = values.link;
  if (values.appLink !== undefined) payload.app_link = values.appLink;
  if (values.sortOrder !== undefined) payload.sort_order = values.sortOrder;
  if (values.published !== undefined) {
    payload.published = values.published;
    if (values.published === true && !opts?.wasPublished) {
      payload.published_at = new Date().toISOString();
    }
    if (values.published === false) {
      payload.published_at = null;
    }
  }
  if (values.featured !== undefined) payload.featured = values.featured;
  if (values.coverImage !== undefined) {
    const cover = values.coverImage;
    if (values.images !== undefined) {
      const urls = values.images.map((img) => img.url);
      payload.cover_image =
        cover && urls.includes(cover) ? cover : (urls[0] ?? null);
    } else {
      payload.cover_image = cover;
    }
  }
  if (values.technologies !== undefined) {
    payload.technologies = values.technologies;
  }
  if (values.features !== undefined) payload.features = values.features;
  if (values.clientNeed !== undefined) payload.client_need = values.clientNeed;
  if (values.objective !== undefined) payload.objective = values.objective;
  if (values.solution !== undefined) payload.solution = values.solution;
  if (values.result !== undefined) payload.result = values.result;
  if (values.seoTitle !== undefined) payload.seo_title = values.seoTitle;
  if (values.seoDescription !== undefined) {
    payload.seo_description = values.seoDescription;
  }
  if (values.reference !== undefined) payload.reference = values.reference;
  return payload;
}

export async function createProject(
  values: ProjectWriteInput
): Promise<
  | { ok: true; project: ProjectRow }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "persist_failed"
        | "duplicate_slug"
        | "duplicate_reference";
    }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const reference =
    values.reference?.trim() || (await allocateNextCaseReference());

  const payload = {
    ...writeToDbPayload({ ...values, reference }),
    reference,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select(PROJECT_SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      const msg = error.message.toLowerCase();
      if (msg.includes("reference")) {
        return { ok: false, reason: "duplicate_reference" };
      }
      return { ok: false, reason: "duplicate_slug" };
    }
    console.error("[projects] create", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  return {
    ok: true,
    project: normalizeRow(data as Record<string, unknown>),
  };
}

export async function updateProject(
  id: string,
  values: ProjectPatchInput
): Promise<
  | { ok: true; project: ProjectRow }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "persist_failed"
        | "duplicate_slug"
        | "duplicate_reference"
        | "invalid_id";
    }
> {
  if (!UUID_RE.test(id)) return { ok: false, reason: "invalid_id" };
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  let wasPublished = false;
  if (values.published !== undefined) {
    const { data: existing } = await supabase
      .from("projects")
      .select("published")
      .eq("id", id)
      .maybeSingle();
    wasPublished = Boolean(existing?.published);
  }

  const { data, error } = await supabase
    .from("projects")
    .update(writeToDbPayload(values, { wasPublished }))
    .eq("id", id)
    .select(PROJECT_SELECT)
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      const msg = error.message.toLowerCase();
      if (msg.includes("reference")) {
        return { ok: false, reason: "duplicate_reference" };
      }
      return { ok: false, reason: "duplicate_slug" };
    }
    console.error("[projects] update", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  if (!data) return { ok: false, reason: "persist_failed" };

  return {
    ok: true,
    project: normalizeRow(data as Record<string, unknown>),
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;
  if (!isSupabaseServiceConfigured()) return false;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return false;

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("[projects] delete", error.message);
    return false;
  }
  return true;
}

export function countDemoProjects(): number {
  return projectCatalog.length;
}
