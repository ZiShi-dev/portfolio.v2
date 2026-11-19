import webpush from "web-push";
import type { ProjectInquiryRow } from "@/lib/project-inquiry/store";
import { deliverWithRetry } from "@/lib/admin/push/deliver";
import {
  buildInquiryPushPayload,
  isAllowedPushEndpoint,
  pushTopicForInquiry,
  selectPushRecipients,
} from "@/lib/admin/push/schema";
import {
  deleteAdminPushSubscription,
  listAdminPushSubscriptions,
  type AdminPushSubscriptionRow,
} from "@/lib/admin/push/store";
import {
  getVapidPrivateKey,
  getVapidPublicKey,
  getVapidSubject,
  isWebPushConfigured,
} from "@/lib/admin/push/vapid";
import { isAdminConfigured, isAllowedAdminEmail } from "@/lib/admin/allowlist";

export type PushSendInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  payload: string;
  topic?: string;
};

async function sendWebPush(input: PushSendInput): Promise<void> {
  webpush.setVapidDetails(
    getVapidSubject(),
    getVapidPublicKey(),
    getVapidPrivateKey()
  );
  await webpush.sendNotification(
    {
      endpoint: input.endpoint,
      keys: { p256dh: input.p256dh, auth: input.auth },
    },
    input.payload,
    {
      TTL: 60 * 60 * 12,
      urgency: "high",
      timeout: 8_000,
      topic: input.topic,
    }
  );
}

export type PushDelivery = "sent" | "retry" | "skipped";

async function sendToSubscription(
  row: AdminPushSubscriptionRow,
  inquiryId: string,
  sender: (input: PushSendInput) => Promise<void>
): Promise<PushDelivery> {
  if (!isAllowedPushEndpoint(row.endpoint)) {
    await deleteAdminPushSubscription(row.endpoint);
    return "sent";
  }

  const payload = JSON.stringify(
    buildInquiryPushPayload({ id: inquiryId, locale: row.locale })
  );
  const result = await deliverWithRetry(() =>
    sender({
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
      payload,
      topic: pushTopicForInquiry(inquiryId),
    })
  );

  if (result === "gone") {
    await deleteAdminPushSubscription(row.endpoint);
    return "sent";
  }
  if (result === "failed") {
    console.error("[admin-push] send failed");
    return "retry";
  }
  return "sent";
}

export async function notifyAdminsOfNewInquiry(
  inquiry: Pick<ProjectInquiryRow, "id">,
  sender: (input: PushSendInput) => Promise<void> = sendWebPush
): Promise<PushDelivery> {
  if (!isWebPushConfigured()) return "skipped";

  const subscriptions = await listAdminPushSubscriptions();
  if (subscriptions === null) return "retry";
  if (subscriptions.length === 0) return "sent";

  const { deliver, revoke } = selectPushRecipients(subscriptions, {
    allowlistConfigured: isAdminConfigured(),
    isAllowed: isAllowedAdminEmail,
  });

  const results = await Promise.all([
    ...revoke.map(async (row) => {
      await deleteAdminPushSubscription(row.endpoint);
      return "sent" as const;
    }),
    ...deliver.map((row) => sendToSubscription(row, inquiry.id, sender)),
  ]);

  return results.includes("retry") ? "retry" : "sent";
}
