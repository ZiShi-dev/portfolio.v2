import { normalizeEmail } from "@/lib/form-validation";
import {
  PUSH_LIMITS,
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
};

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

  const { error } = await supabase.from("admin_push_subscriptions").upsert(
    {
      admin_email: email,
      endpoint: input.subscription.endpoint,
      p256dh: input.subscription.keys.p256dh,
      auth: input.subscription.keys.auth,
      user_agent: userAgent,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

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

export async function listAdminPushSubscriptions(): Promise<
  AdminPushSubscriptionRow[]
> {
  if (!isSupabaseServiceConfigured()) return [];
  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .select("id, admin_email, endpoint, p256dh, auth")
    .limit(80);

  if (error) {
    console.error("[admin-push] list", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    admin_email: String(row.admin_email),
    endpoint: String(row.endpoint),
    p256dh: String(row.p256dh),
    auth: String(row.auth),
  }));
}
