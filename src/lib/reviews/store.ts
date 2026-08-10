import { hashForAudit } from "@/lib/security/fingerprint";
import { normalizeEmail } from "@/lib/form-validation";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";
import type { ReviewItem } from "@/data/reviews";

export type ReviewStatus = "pending" | "published" | "rejected";

export type ReviewRow = {
  id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  name: string;
  email: string;
  role: string | null;
  message: string;
  rating: number;
  status: ReviewStatus;
  fingerprint: string | null;
  ip_hash: string | null;
  project_id: string | null;
};

export type SaveReviewInput = {
  name: string;
  email: string;
  role?: string;
  message: string;
  rating: number;
  fingerprint: string;
  ip: string;
  userAgent?: string | null;
  projectId?: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function reviewRowToItem(row: Pick<ReviewRow, "id" | "name" | "role" | "message" | "rating">): ReviewItem {
  return {
    id: row.id,
    name: row.name,
    role: row.role?.trim() || "",
    text: row.message,
    rating: row.rating,
  };
}

/**
 * Avis publiés pour le site.
 * Si Supabase non configuré, BDD coupée ou requête en échec → liste vide
 * (jamais d’avis démo / fictifs).
 */
export async function getPublishedReviews(): Promise<ReviewItem[]> {
  if (!isSupabaseServiceConfigured()) {
    return [];
  }

  const rows = await listReviews({ status: "published", limit: 100 });
  if (rows === null) {
    return [];
  }

  return rows.map(reviewRowToItem);
}

export type SaveReviewResult =
  | { ok: true; id: string; duplicate?: boolean }
  | { ok: false; reason?: "duplicate_email" | "persist_failed" | "not_configured" };

/**
 * Avis déjà actif (pending ou published) pour cet email.
 */
export async function findActiveReviewByEmail(
  email: string
): Promise<{ id: string; status: ReviewStatus; name: string } | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from("reviews")
    .select("id, status, name")
    .eq("email", normalized)
    .in("status", ["pending", "published"])
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as { id: string; status: ReviewStatus; name: string };
}

export async function countReviewsInWindow(options: {
  since: string;
  ip?: string;
  email?: string;
}): Promise<{ count: number; oldestCreatedAt: string | null } | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  let countQuery = supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .gte("created_at", options.since);

  if (options.email) {
    countQuery = countQuery.eq("email", normalizeEmail(options.email));
  }
  if (options.ip) {
    countQuery = countQuery.eq("ip_hash", hashForAudit(options.ip));
  }

  const { count, error: countError } = await countQuery;
  if (countError) {
    console.error("[reviews] window count failed", countError.code ?? "unknown");
    return null;
  }

  let oldestQuery = supabase
    .from("reviews")
    .select("created_at")
    .gte("created_at", options.since)
    .order("created_at", { ascending: true })
    .limit(1);

  if (options.email) {
    oldestQuery = oldestQuery.eq("email", normalizeEmail(options.email));
  }
  if (options.ip) {
    oldestQuery = oldestQuery.eq("ip_hash", hashForAudit(options.ip));
  }

  const { data: oldestRows, error: oldestError } = await oldestQuery;
  if (oldestError) {
    console.error("[reviews] window oldest failed", oldestError.code ?? "unknown");
    return null;
  }

  return {
    count: count ?? 0,
    oldestCreatedAt: oldestRows?.[0]?.created_at ?? null,
  };
}

export async function saveReview(
  input: SaveReviewInput
): Promise<SaveReviewResult> {
  if (!isSupabaseServiceConfigured()) return { ok: false, reason: "not_configured" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const email = normalizeEmail(input.email);
  const existing = await findActiveReviewByEmail(email);
  if (existing) {
    return { ok: false, reason: "duplicate_email" };
  }

  const now = new Date().toISOString();
  const projectId =
    input.projectId && UUID_RE.test(input.projectId) ? input.projectId : null;

  // Ne pas envoyer project_id si absent : la colonne peut manquer tant que
  // la migration 019 n’est pas appliquée.
  const row: Record<string, unknown> = {
    name: input.name,
    email,
    role: input.role?.trim() || null,
    message: input.message,
    rating: input.rating,
    fingerprint: input.fingerprint,
    ip_hash: hashForAudit(input.ip),
    user_agent_hash: input.userAgent
      ? hashForAudit(input.userAgent.slice(0, 256))
      : null,
    // Publié tout de suite — l’admin retire ensuite si besoin.
    status: "published" as const,
    published_at: now,
  };
  if (projectId) {
    row.project_id = projectId;
  }

  let { data, error } = await supabase
    .from("reviews")
    .insert(row)
    .select("id")
    .maybeSingle();

  // Colonne project_id absente → réessayer sans le champ.
  if (
    error &&
    projectId &&
    /project_id/i.test(String(error.message ?? error.details ?? ""))
  ) {
    delete row.project_id;
    ({ data, error } = await supabase
      .from("reviews")
      .insert(row)
      .select("id")
      .maybeSingle());
  }

  if (error) {
    if (error.code === "23505") {
      // fingerprint OU email unique actif
      if (String(error.message ?? "").toLowerCase().includes("email")) {
        return { ok: false, reason: "duplicate_email" };
      }
      return { ok: true, id: "duplicate", duplicate: true };
    }
    console.error("[reviews] persist failed", error.code ?? "unknown");
    return { ok: false, reason: "persist_failed" };
  }

  if (!data?.id) return { ok: false, reason: "persist_failed" };
  return { ok: true, id: data.id };
}

const REVIEW_LIST_SELECT =
  "id, created_at, updated_at, published_at, name, email, role, message, rating, status, fingerprint, ip_hash, project_id";

/** Sans project_id — compatible DB avant migration 019. */
const REVIEW_LIST_SELECT_LEGACY =
  "id, created_at, updated_at, published_at, name, email, role, message, rating, status, fingerprint, ip_hash";

export async function listReviews(options?: {
  status?: ReviewStatus | "all";
  limit?: number;
}): Promise<ReviewRow[] | null> {
  const client = createSupabaseServiceClient();
  if (!client) return null;

  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
  const statusFilter =
    options?.status && options.status !== "all" ? options.status : null;

  const buildQuery = (select: typeof REVIEW_LIST_SELECT | typeof REVIEW_LIST_SELECT_LEGACY) => {
    let query = client
      .from("reviews")
      .select(select)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }
    return query;
  };

  let result = await buildQuery(REVIEW_LIST_SELECT);

  if (
    result.error &&
    /project_id/i.test(
      String(result.error.message ?? result.error.details ?? "")
    )
  ) {
    result = await buildQuery(REVIEW_LIST_SELECT_LEGACY);
  }

  if (result.error) {
    console.error(
      "[reviews] list failed",
      result.error.message ||
        result.error.code ||
        result.error.hint ||
        "unknown"
    );
    return null;
  }

  const rows = (result.data ?? []) as unknown as Array<
    Omit<ReviewRow, "project_id"> & { project_id?: string | null }
  >;

  return rows.map((row) => ({
    ...row,
    project_id: row.project_id ?? null,
  }));
}

export async function countReviewsByStatus(
  status: ReviewStatus
): Promise<number> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) return 0;
  return count ?? 0;
}

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus
): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  if (!supabase || !UUID_RE.test(id)) return false;

  const patch: Record<string, string | null> = { status };
  if (status === "published") {
    patch.published_at = new Date().toISOString();
  } else {
    // Retirer / rejeter → plus visible
    patch.published_at = null;
  }

  const { error } = await supabase.from("reviews").update(patch).eq("id", id);
  return !error;
}

export async function updateReviewProjectId(
  id: string,
  projectId: string | null
): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  if (!supabase || !UUID_RE.test(id)) return false;
  if (projectId !== null && !UUID_RE.test(projectId)) return false;

  const { error } = await supabase
    .from("reviews")
    .update({ project_id: projectId })
    .eq("id", id);
  return !error;
}

/** Avis publiés liés à un Case Study. */
export async function getPublishedReviewsForProject(
  projectId: string
): Promise<ReviewItem[]> {
  if (!UUID_RE.test(projectId) || !isSupabaseServiceConfigured()) return [];
  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, role, message, rating")
    .eq("status", "published")
    .eq("project_id", projectId)
    .order("published_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("[reviews] project reviews", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    reviewRowToItem(
      row as Pick<ReviewRow, "id" | "name" | "role" | "message" | "rating">
    )
  );
}

export async function deleteReview(id: string): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  if (!supabase || !UUID_RE.test(id)) return false;

  const { error } = await supabase.from("reviews").delete().eq("id", id);
  return !error;
}
