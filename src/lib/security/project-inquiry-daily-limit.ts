import { normalizeEmail } from "@/lib/form-validation";
import {
  countProjectInquiriesInWindow,
  type ProjectInquiryWindowStats,
} from "@/lib/project-inquiry/store";
import { FORM_SECURITY } from "@/lib/security/constants";
import { evaluateDailyLimitFromCount } from "@/lib/security/contact-daily-limit";
import { hashForAudit } from "@/lib/security/fingerprint";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

export type ProjectInquiryDailyLimitResult = {
  allowed: boolean;
  retryAfterSec?: number;
  source?: "database" | "memory";
};

type RateEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, RateEntry>();

/** Injecteur test — simule le décompte BDD sans Postgres live. */
let countOverride:
  | ((options: {
      since: string;
      email?: string;
      ip?: string;
    }) => Promise<ProjectInquiryWindowStats | null>)
  | null = null;

function pruneMemory(now: number) {
  for (const [key, entry] of memoryStore.entries()) {
    if (now >= entry.resetAt) memoryStore.delete(key);
  }
}

function checkMemoryDailyLimit(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now()
): ProjectInquiryDailyLimitResult {
  pruneMemory(now);

  const entry = memoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, source: "memory" };
  }

  if (entry.count >= max) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
      source: "memory",
    };
  }

  entry.count += 1;
  return { allowed: true, source: "memory" };
}

async function checkDbDailyLimit(
  filter: { email?: string; ip?: string },
  max: number,
  windowMs: number,
  now = Date.now()
): Promise<ProjectInquiryDailyLimitResult | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const since = new Date(now - windowMs).toISOString();
  const stats = countOverride
    ? await countOverride({ ...filter, since })
    : await countProjectInquiriesInWindow({ ...filter, since });

  if (stats === null) return null;

  const oldestMs = stats.oldestCreatedAt
    ? new Date(stats.oldestCreatedAt).getTime()
    : null;

  const result = evaluateDailyLimitFromCount(
    stats.count,
    max,
    oldestMs,
    now,
    windowMs
  );
  return { ...result, source: "database" };
}

/** 1 lead max / email / 24 h — BDD si dispo, sinon mémoire. */
export async function checkProjectInquiryEmailDailyLimit(
  email: string | undefined,
  now = Date.now()
): Promise<ProjectInquiryDailyLimitResult> {
  if (!email) return { allowed: true };

  const normalized = normalizeEmail(email);
  const fromDb = await checkDbDailyLimit(
    { email: normalized },
    FORM_SECURITY.PROJECT_INQUIRY_EMAIL_DAILY_MAX,
    FORM_SECURITY.PROJECT_INQUIRY_EMAIL_DAILY_WINDOW_MS,
    now
  );
  if (fromDb) return fromDb;

  return checkMemoryDailyLimit(
    `project-inquiry-email:${hashForAudit(normalized)}`,
    FORM_SECURITY.PROJECT_INQUIRY_EMAIL_DAILY_MAX,
    FORM_SECURITY.PROJECT_INQUIRY_EMAIL_DAILY_WINDOW_MS,
    now
  );
}

/** Plafond journalier leads par IP. */
export async function checkProjectInquiryIpDailyLimit(
  ip: string,
  now = Date.now()
): Promise<ProjectInquiryDailyLimitResult> {
  const fromDb = await checkDbDailyLimit(
    { ip },
    FORM_SECURITY.PROJECT_INQUIRY_IP_DAILY_MAX,
    FORM_SECURITY.PROJECT_INQUIRY_IP_DAILY_WINDOW_MS,
    now
  );
  if (fromDb) return fromDb;

  return checkMemoryDailyLimit(
    `project-inquiry-ip:${hashForAudit(ip)}`,
    FORM_SECURITY.PROJECT_INQUIRY_IP_DAILY_MAX,
    FORM_SECURITY.PROJECT_INQUIRY_IP_DAILY_WINDOW_MS,
    now
  );
}

/** Tests unitaires uniquement. */
export function clearProjectInquiryDailyLimitsForTests() {
  memoryStore.clear();
  countOverride = null;
}

export function setProjectInquiryCounterForTests(
  fn: (options: {
    since: string;
    email?: string;
    ip?: string;
  }) => Promise<ProjectInquiryWindowStats | null>
) {
  countOverride = fn;
}
