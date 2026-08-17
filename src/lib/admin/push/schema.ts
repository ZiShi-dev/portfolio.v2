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

export const pushSubscriptionBodySchema = z.object({
  endpoint: z
    .string()
    .trim()
    .url()
    .min(12)
    .max(PUSH_LIMITS.maxEndpoint)
    .refine(
      (value) => value.startsWith("https://") || value.startsWith("http://localhost"),
      "endpoint_insecure"
    ),
  keys: z.object({
    p256dh: keySchema,
    auth: keySchema,
  }),
});

export type PushSubscriptionBody = z.infer<typeof pushSubscriptionBodySchema>;

export function parsePushSubscriptionBody(input: unknown):
  | { ok: true; value: PushSubscriptionBody }
  | { ok: false; error: "invalid_request" } {
  const parsed = pushSubscriptionBodySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_request" };
  return { ok: true, value: parsed.data };
}

export type AdminPushPayload = {
  title: string;
  body: string;
  url: string;
};

export function buildInquiryPushPayload(input: {
  reference: string;
  name: string;
}): AdminPushPayload {
  const reference = input.reference.trim().slice(0, 40);
  const name = input.name.trim().slice(0, 80);
  return {
    title: "VORZIX · Nouvelle demande",
    body: [reference, name].filter(Boolean).join(" · "),
    url: "/admin/inquiries",
  };
}
