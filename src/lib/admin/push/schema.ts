import { z } from "zod";

export const PUSH_LIMITS = {
  maxEndpoint: 2048,
  maxKey: 256,
  maxUserAgent: 400,
  maxSubscriptionsPerAdmin: 8,
} as const;

const keySchema = z
  .string()
  .trim()
  .min(8)
  .max(PUSH_LIMITS.maxKey);

/** Browser-owned push services only: endpoints are later contacted by our server. */
export function isAllowedPushEndpoint(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return false;
    const host = url.hostname;
    return host === "fcm.googleapis.com" || host === "android.googleapis.com"
      || host === "web.push.apple.com"
      || host === "updates.push.services.mozilla.com"
      || host.endsWith(".push.services.mozilla.com")
      || host.endsWith(".notify.windows.com")
      || host.endsWith(".wns.windows.com");
  } catch { return false; }
}

export const PUSH_LOCALES = ["fr", "en", "ar"] as const;
export type PushLocale = (typeof PUSH_LOCALES)[number];

export const pushSubscriptionBodySchema = z.object({
  endpoint: z
    .string()
    .trim()
    .url()
    .min(12)
    .max(PUSH_LIMITS.maxEndpoint)
    .refine(isAllowedPushEndpoint, "endpoint_not_allowed"),
  keys: z.object({
    p256dh: keySchema,
    auth: keySchema,
  }),
  locale: z.enum(PUSH_LOCALES).optional(),
});

export type PushSubscriptionBody = z.infer<typeof pushSubscriptionBodySchema>;

export function parsePushSubscriptionBody(input: unknown):
  | { ok: true; value: PushSubscriptionBody }
  | { ok: false; error: "invalid_request" } {
  const parsed = pushSubscriptionBodySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_request" };
  return { ok: true, value: parsed.data };
}

const INQUIRY_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PUSH_COPY: Record<PushLocale, { title: string; body: string }> = {
  fr: {
    title: "Nouvelle demande de projet",
    body: "Une nouvelle demande de projet est arrivée. Appuyez pour voir le détail.",
  },
  en: {
    title: "New project request",
    body: "A new project request has arrived. Tap to view the details.",
  },
  ar: {
    title: "طلب مشروع جديد",
    body: "وصل طلب جديد لإنشاء مشروع. اضغط لعرض التفاصيل.",
  },
};

export type AdminPushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  id: string | null;
};

export function isInquiryId(value: string): boolean {
  return INQUIRY_ID.test(value.trim());
}

export function normalizePushLocale(value: string | null | undefined): PushLocale {
  if (value === "en" || value === "ar" || value === "fr") return value;
  return "fr";
}

/** Sujet Web Push (32 caractères max, base64 URL-safe) pour remplacer un envoi répété. */
export function pushTopicForInquiry(id: string): string | undefined {
  if (!isInquiryId(id)) return undefined;
  return id.replaceAll("-", "").toLowerCase();
}

export function buildInquiryPushPayload(input: {
  id: string;
  locale?: string | null;
}): AdminPushPayload {
  const copy = PUSH_COPY[normalizePushLocale(input.locale)];
  const id = input.id.trim().toLowerCase();
  const linked = isInquiryId(id);
  return {
    title: copy.title,
    body: copy.body,
    url: linked ? `/admin/inquiries?id=${id}` : "/admin/inquiries",
    tag: linked ? `inquiry-${id}` : "vorzix-inquiry",
    id: linked ? id : null,
  };
}

export function selectPushRecipients<T extends { admin_email: string }>(
  rows: T[],
  options: {
    allowlistConfigured: boolean;
    isAllowed: (email: string) => boolean;
  }
): { deliver: T[]; revoke: T[] } {
  if (!options.allowlistConfigured) return { deliver: [], revoke: [] };
  const deliver: T[] = [];
  const revoke: T[] = [];
  for (const row of rows) {
    if (options.isAllowed(row.admin_email)) deliver.push(row);
    else revoke.push(row);
  }
  return { deliver, revoke };
}
