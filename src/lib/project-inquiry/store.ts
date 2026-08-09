import { hashForAudit } from "@/lib/security/fingerprint";
import { normalizeEmail } from "@/lib/form-validation";
import {
  formatLeadReference,
  parseLeadReferenceNumber,
  type ProjectInquiryAdminPatch,
  type ProjectInquiryPayload,
} from "@/lib/project-inquiry/schema";
import type { ProjectInquiryStatus } from "@/data/project-inquiry-options";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SELECT =
  "id, created_at, updated_at, reference, status, project_type, project_type_other, objective, objective_other, budget_range, budget_custom_amount, timeline, target_launch_date, description, name, email, phone, whatsapp, company, current_website, locale, source, service_id, service_reference, admin_notes";

export type ProjectInquiryRow = {
  id: string;
  created_at: string;
  updated_at: string;
  reference: string;
  status: ProjectInquiryStatus;
  project_type: string;
  project_type_other: string | null;
  objective: string;
  objective_other: string | null;
  budget_range: string;
  budget_custom_amount: number | null;
  timeline: string;
  target_launch_date: string | null;
  description: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  current_website: string | null;
  locale: string;
  source: string | null;
  service_id: string | null;
  service_reference: string | null;
  admin_notes: string | null;
};

function normalizeRow(raw: Record<string, unknown>): ProjectInquiryRow {
  return {
    id: String(raw.id),
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at),
    reference: String(raw.reference ?? ""),
    status: (raw.status as ProjectInquiryStatus) || "new",
    project_type: String(raw.project_type ?? ""),
    project_type_other:
      typeof raw.project_type_other === "string" ? raw.project_type_other : null,
    objective: String(raw.objective ?? ""),
    objective_other:
      typeof raw.objective_other === "string" ? raw.objective_other : null,
    budget_range: String(raw.budget_range ?? ""),
    budget_custom_amount:
      typeof raw.budget_custom_amount === "number" &&
      Number.isFinite(raw.budget_custom_amount)
        ? Math.round(raw.budget_custom_amount)
        : null,
    timeline: String(raw.timeline ?? ""),
    target_launch_date:
      typeof raw.target_launch_date === "string"
        ? raw.target_launch_date
        : null,
    description: String(raw.description ?? ""),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: typeof raw.phone === "string" ? raw.phone : null,
    whatsapp: typeof raw.whatsapp === "string" ? raw.whatsapp : null,
    company: typeof raw.company === "string" ? raw.company : null,
    current_website:
      typeof raw.current_website === "string" ? raw.current_website : null,
    locale: String(raw.locale ?? "fr"),
    source: typeof raw.source === "string" ? raw.source : null,
    service_id: typeof raw.service_id === "string" ? raw.service_id : null,
    service_reference:
      typeof raw.service_reference === "string" ? raw.service_reference : null,
    admin_notes: typeof raw.admin_notes === "string" ? raw.admin_notes : null,
  };
}

export async function allocateNextLeadReference(): Promise<string> {
  if (!isSupabaseServiceConfigured()) return formatLeadReference(1);
  const supabase = createSupabaseServiceClient();
  if (!supabase) return formatLeadReference(1);

  const { data, error } = await supabase
    .from("project_inquiries")
    .select("reference")
    .not("reference", "is", null)
    .limit(500);

  if (error) {
    console.error("[project-inquiry] allocate reference", error.message);
    return formatLeadReference(1);
  }

  let max = 0;
  for (const row of data ?? []) {
    const n = parseLeadReferenceNumber(
      typeof row.reference === "string" ? row.reference : null
    );
    if (n !== null && n > max) max = n;
  }
  return formatLeadReference(max + 1);
}

export async function createProjectInquiry(input: {
  data: ProjectInquiryPayload;
  fingerprint: string;
  ip: string;
  userAgent: string | null;
}): Promise<
  | { ok: true; inquiry: ProjectInquiryRow }
  | { ok: false; reason: "not_configured" | "persist_failed" | "duplicate" }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const reference = await allocateNextLeadReference();
  const { data, error } = await supabase
    .from("project_inquiries")
    .insert({
      reference,
      status: "new",
      project_type: input.data.projectType,
      project_type_other: input.data.projectTypeOther,
      objective: input.data.objective,
      objective_other: input.data.objectiveOther,
      budget_range: input.data.budgetRange,
      budget_custom_amount: input.data.budgetCustomAmount,
      timeline: input.data.timeline,
      target_launch_date: input.data.targetLaunchDate,
      description: input.data.description,
      name: input.data.name,
      email: input.data.email,
      phone: input.data.phone,
      whatsapp: input.data.whatsapp,
      company: input.data.company,
      current_website: input.data.currentWebsite,
      locale: input.data.locale,
      source: input.data.source,
      service_id: input.data.serviceId,
      service_reference: input.data.serviceReference,
      fingerprint: input.fingerprint,
      ip_hash: hashForAudit(input.ip),
      user_agent_hash: input.userAgent
        ? hashForAudit(input.userAgent)
        : null,
    })
    .select(SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, reason: "duplicate" };
    }
    console.error("[project-inquiry] create", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  return {
    ok: true,
    inquiry: normalizeRow(data as Record<string, unknown>),
  };
}

export async function listProjectInquiriesForAdmin(options?: {
  status?: ProjectInquiryStatus | "all";
  limit?: number;
}): Promise<
  | { ok: true; configured: true; inquiries: ProjectInquiryRow[] }
  | { ok: true; configured: false; inquiries: [] }
  | { ok: false; reason: "persist_failed" }
> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: true, configured: false, inquiries: [] };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: true, configured: false, inquiries: [] };

  const limit = Math.min(Math.max(1, options?.limit ?? 100), 200);
  let query = supabase
    .from("project_inquiries")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[project-inquiry] list", error.message);
    return { ok: false, reason: "persist_failed" };
  }

  return {
    ok: true,
    configured: true,
    inquiries: (data ?? []).map((row) =>
      normalizeRow(row as Record<string, unknown>)
    ),
  };
}

export async function getProjectInquiryById(
  id: string
): Promise<ProjectInquiryRow | null> {
  if (!UUID_RE.test(id)) return null;
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("project_inquiries")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export async function updateProjectInquiry(
  id: string,
  patch: ProjectInquiryAdminPatch
): Promise<
  | { ok: true; inquiry: ProjectInquiryRow }
  | { ok: false; reason: "not_configured" | "persist_failed" | "invalid_id" }
> {
  if (!UUID_RE.test(id)) return { ok: false, reason: "invalid_id" };
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const payload: Record<string, unknown> = {};
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.adminNotes !== undefined) payload.admin_notes = patch.adminNotes;

  const { data, error } = await supabase
    .from("project_inquiries")
    .update(payload)
    .eq("id", id)
    .select(SELECT)
    .maybeSingle();

  if (error) {
    console.error("[project-inquiry] update", error.message);
    return { ok: false, reason: "persist_failed" };
  }
  if (!data) return { ok: false, reason: "persist_failed" };

  return {
    ok: true,
    inquiry: normalizeRow(data as Record<string, unknown>),
  };
}

export async function deleteProjectInquiry(id: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;
  if (!isSupabaseServiceConfigured()) return false;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("project_inquiries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[project-inquiry] delete", error.message);
    return false;
  }
  return true;
}

export async function countNewProjectInquiries(): Promise<number> {
  if (!isSupabaseServiceConfigured()) return 0;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("project_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  if (error) return 0;
  return count ?? 0;
}

export type ProjectInquiryWindowStats = {
  count: number;
  oldestCreatedAt: string | null;
};

/**
 * Compte les leads projet sur une fenêtre glissante (rate limit BDD).
 * Retourne null si Supabase indisponible.
 */
export async function countProjectInquiriesInWindow(options: {
  since: string;
  email?: string;
  ip?: string;
}): Promise<ProjectInquiryWindowStats | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  let countQuery = supabase
    .from("project_inquiries")
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
    console.error(
      "[project-inquiry] daily count failed",
      countError.code ?? "unknown"
    );
    return null;
  }

  let oldestQuery = supabase
    .from("project_inquiries")
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
    console.error(
      "[project-inquiry] daily oldest failed",
      oldestError.code ?? "unknown"
    );
    return null;
  }

  return {
    count: count ?? 0,
    oldestCreatedAt: oldestRows?.[0]?.created_at ?? null,
  };
}
