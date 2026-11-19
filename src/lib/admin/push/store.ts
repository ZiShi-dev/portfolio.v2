import { normalizeEmail } from "@/lib/form-validation";
import {
  normalizePushLocale,
  PUSH_LIMITS,
  type PushLocale,
  type PushSubscriptionBody,
} from "@/lib/admin/push/schema";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

export type AdminPushSubscriptionRow = {
  id: string;
  admin_email: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  locale: PushLocale;
};

function missingLocaleColumn(message: string): boolean {
  return /locale/i.test(message) && /column|schema/i.test(message);
}

function mapSubscriptionRow(row: {
  id: unknown;
  admin_email: unknown;
  endpoint: unknown;
  p256dh: unknown;
  auth: unknown;
  locale?: unknown;
}): AdminPushSubscriptionRow {
  return {
    id: String(row.id),
    admin_email: String(row.admin_email),
    endpoint: String(row.endpoint),
    p256dh: String(row.p256dh),
    auth: String(row.auth),
    locale: normalizePushLocale(typeof row.locale === "string" ? row.locale : null),
  };
}

export async function upsertAdminPushSubscription(input: {
  email: string;
  subscription: PushSubscriptionBody;
  userAgent: string | null;
}): Promise<boolean> {
  if (!isSupabaseServiceConfigured()) return false;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return false;

  const email = normalizeEmail(input.email);
  const userAgent = input.userAgent?.trim().slice(0, PUSH_LIMITS.maxUserAgent) || null;

  const row = {
    admin_email: email,
    endpoint: input.subscription.endpoint,
    p256dh: input.subscription.keys.p256dh,
    auth: input.subscription.keys.auth,
    user_agent: userAgent,
    last_seen_at: new Date().toISOString(),
  };
  let { error } = await supabase.from("admin_push_subscriptions").upsert(
    {
      ...row,
      locale: normalizePushLocale(input.subscription.locale),
    },
    { onConflict: "endpoint" }
  );

  if (error && missingLocaleColumn(error.message)) {
    ({ error } = await supabase
      .from("admin_push_subscriptions")
      .upsert(row, { onConflict: "endpoint" }));
  }

  if (error) {
    console.error("[admin-push] upsert", error.message);
    return false;
  }

  const { data: extras } = await supabase
    .from("admin_push_subscriptions")
    .select("id")
    .eq("admin_email", email)
    .order("last_seen_at", { ascending: false })
    .range(PUSH_LIMITS.maxSubscriptionsPerAdmin, 200);

  const staleIds = (extras ?? []).map((row) => row.id as string).filter(Boolean);
  if (staleIds.length > 0) {
    await supabase.from("admin_push_subscriptions").delete().in("id", staleIds);
  }

  return true;
}

export async function deleteAdminPushSubscription(endpoint: string): Promise<void> {
  if (!isSupabaseServiceConfigured()) return;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return;
  await supabase.from("admin_push_subscriptions").delete().eq("endpoint", endpoint);
}

/** Retire uniquement l'appareil de l'admin connecté. Un autre compte ne peut pas l'effacer. */
export async function deleteAdminPushSubscriptionForAdmin(
  email: string,
  endpoint: string
): Promise<void> {
  if (!isSupabaseServiceConfigured()) return;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return;
  await supabase
    .from("admin_push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("admin_email", normalizeEmail(email));
}

export async function listAdminPushSubscriptions(): Promise<
  AdminPushSubscriptionRow[] | null
> {
  if (!isSupabaseServiceConfigured()) return null;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const listed = await supabase
    .from("admin_push_subscriptions")
    .select("id, admin_email, endpoint, p256dh, auth, locale")
    .limit(80);

  const fallback =
    listed.error && missingLocaleColumn(listed.error.message)
      ? await supabase
          .from("admin_push_subscriptions")
          .select("id, admin_email, endpoint, p256dh, auth")
          .limit(80)
      : null;

  const error = fallback ? fallback.error : listed.error;
  const data = fallback ? fallback.data : listed.data;

  if (error) {
    console.error("[admin-push] list", error.code);
    return null;
  }

  return (data ?? []).map((row) => mapSubscriptionRow(row));
}
