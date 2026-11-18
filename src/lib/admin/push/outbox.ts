import { after } from "next/server";
import {
  notifyAdminsOfNewInquiry,
  type PushDelivery,
} from "@/lib/admin/push/notify";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

export const PUSH_OUTBOX_MAX_ATTEMPTS = 8;
export const PUSH_OUTBOX_BACKOFF_MS = [
  30_000, 60_000, 120_000, 240_000, 480_000, 900_000,
] as const;
export const PUSH_OUTBOX_SKIP_DELAY_MS = 10 * 60 * 1000;
export const PUSH_OUTBOX_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type OutboxDecision = {
  status: "sent" | "pending" | "dead";
  attempts: number;
  nextAttemptAt: string;
  lastError: string | null;
  sentAt: string | null;
};

export function decideOutboxUpdate(input: {
  outcome: PushDelivery;
  attempts: number;
  createdAtMs: number;
  nowMs: number;
}): OutboxDecision {
  const nowIso = new Date(input.nowMs).toISOString();
  if (input.outcome === "sent") {
    return {
      status: "sent",
      attempts: input.attempts,
      nextAttemptAt: nowIso,
      lastError: null,
      sentAt: nowIso,
    };
  }

  if (input.outcome === "skipped") {
    const expired = input.nowMs - input.createdAtMs >= PUSH_OUTBOX_MAX_AGE_MS;
    return {
      status: expired ? "dead" : "pending",
      attempts: input.attempts,
      nextAttemptAt: new Date(input.nowMs + PUSH_OUTBOX_SKIP_DELAY_MS).toISOString(),
      lastError: expired ? "unconfigured" : "waiting_configuration",
      sentAt: null,
    };
  }

  const nextAttempts = input.attempts + 1;
  if (nextAttempts >= PUSH_OUTBOX_MAX_ATTEMPTS) {
    return {
      status: "dead",
      attempts: nextAttempts,
      nextAttemptAt: nowIso,
      lastError: "exhausted",
      sentAt: null,
    };
  }

  const delay =
    PUSH_OUTBOX_BACKOFF_MS[
      Math.min(nextAttempts - 1, PUSH_OUTBOX_BACKOFF_MS.length - 1)
    ] ?? PUSH_OUTBOX_BACKOFF_MS[PUSH_OUTBOX_BACKOFF_MS.length - 1];

  return {
    status: "pending",
    attempts: nextAttempts,
    nextAttemptAt: new Date(input.nowMs + delay).toISOString(),
    lastError: "retry",
    sentAt: null,
  };
}

export type PushOutboxJob = {
  id: string;
  inquiryId: string;
  attempts: number;
  createdAt: string;
  lockedAt: string;
};

export type PushOutboxDrain = {
  unavailable: boolean;
  claimed: number;
  sent: number;
  retry: number;
  dead: number;
};

type ClaimResult = PushOutboxJob[] | "unavailable";

function outboxMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = `${error.code ?? ""} ${error.message ?? ""}`;
  return /PGRST202|42P01|42883|claim_admin_push_outbox|admin_push_outbox|schema cache/i.test(
    message
  );
}

function asJob(row: Record<string, unknown>): PushOutboxJob | null {
  const id = typeof row.id === "string" ? row.id : "";
  const inquiryId = typeof row.inquiry_id === "string" ? row.inquiry_id : "";
  const lockedAt = typeof row.locked_at === "string" ? row.locked_at : "";
  const createdAt = typeof row.created_at === "string" ? row.created_at : "";
  const attempts = Number(row.attempts);
  if (!id || !inquiryId || !lockedAt || !createdAt || !Number.isFinite(attempts)) {
    return null;
  }
  return {
    id,
    inquiryId,
    attempts,
    createdAt,
    lockedAt,
  };
}

async function claimJobs(limit: number): Promise<ClaimResult> {
  if (!isSupabaseServiceConfigured()) return "unavailable";
  const supabase = createSupabaseServiceClient();
  if (!supabase) return "unavailable";

  const { data, error } = await supabase.rpc("claim_admin_push_outbox", {
    batch_size: limit,
    lock_seconds: 180,
  });

  if (error) {
    if (outboxMissing(error)) return "unavailable";
    console.error("[admin-push] claim", error.code ?? "error");
    return [];
  }

  return (Array.isArray(data) ? data : [])
    .map((row) => asJob(row as Record<string, unknown>))
    .filter((job): job is PushOutboxJob => job !== null);
}

async function settleJob(job: PushOutboxJob, decision: OutboxDecision): Promise<void> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return;
  const { error } = await supabase
    .from("admin_push_outbox")
    .update({
      status: decision.status,
      attempts: decision.attempts,
      next_attempt_at: decision.nextAttemptAt,
      last_error: decision.lastError,
      locked_at: null,
      sent_at: decision.sentAt,
    })
    .eq("id", job.id)
    .eq("locked_at", job.lockedAt);

  if (error) console.error("[admin-push] settle", error.code ?? "error");
}

export async function processPushOutbox(options?: {
  limit?: number;
  claim?: () => Promise<ClaimResult>;
  settle?: (job: PushOutboxJob, decision: OutboxDecision) => Promise<void>;
  notify?: (inquiry: { id: string }) => Promise<PushDelivery>;
  now?: () => number;
}): Promise<PushOutboxDrain> {
  const limit = Math.min(10, Math.max(1, options?.limit ?? 5));
  const claim = options?.claim ?? (() => claimJobs(limit));
  const settle = options?.settle ?? settleJob;
  const notify = options?.notify ?? ((inquiry) => notifyAdminsOfNewInquiry(inquiry));
  const now = options?.now ?? (() => Date.now());
  const claimed = await claim();

  if (claimed === "unavailable") {
    return { unavailable: true, claimed: 0, sent: 0, retry: 0, dead: 0 };
  }

  const seen = new Set<string>();
  const jobs = claimed.filter((job) => {
    if (seen.has(job.inquiryId)) return false;
    seen.add(job.inquiryId);
    return true;
  });

  let sent = 0;
  let retry = 0;
  let dead = 0;

  for (const job of jobs) {
    let outcome: PushDelivery = "retry";
    try {
      outcome = await notify({ id: job.inquiryId });
    } catch {
      outcome = "retry";
    }
    const createdAtMs = Date.parse(job.createdAt);
    const decision = decideOutboxUpdate({
      outcome,
      attempts: job.attempts,
      createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : now(),
      nowMs: now(),
    });
    await settle(job, decision);
    if (decision.status === "sent") sent += 1;
    else if (decision.status === "dead") dead += 1;
    else retry += 1;
  }

  return { unavailable: false, claimed: jobs.length, sent, retry, dead };
}

/** Traite la file après la réponse. Si la migration n'est pas encore là, envoie quand même. */
export function scheduleInquiryPush(inquiry: { id: string }): void {
  const task = async () => {
    try {
      const drained = await processPushOutbox();
      if (drained.unavailable) await notifyAdminsOfNewInquiry(inquiry);
    } catch (error) {
      console.error(
        "[admin-push] outbox",
        error instanceof Error ? error.name : "error"
      );
    }
  };

  try {
    after(task);
  } catch {
    void task();
  }
}
