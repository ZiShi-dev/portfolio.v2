import webpush from "web-push";
import type { ProjectInquiryRow } from "@/lib/project-inquiry/store";
import { buildInquiryPushPayload } from "@/lib/admin/push/schema";
import {
  deleteAdminPushSubscription,
  listAdminPushSubscriptions,
} from "@/lib/admin/push/store";
import {
  getVapidPrivateKey,
  getVapidPublicKey,
  getVapidSubject,
  isWebPushConfigured,
} from "@/lib/admin/push/vapid";

export async function notifyAdminsOfNewInquiry(
  inquiry: Pick<ProjectInquiryRow, "reference" | "name">
): Promise<void> {
  if (!isWebPushConfigured()) return;

  const subscriptions = await listAdminPushSubscriptions();
  if (subscriptions.length === 0) return;

  const payload = JSON.stringify(buildInquiryPushPayload(inquiry));

  webpush.setVapidDetails(
    getVapidSubject(),
    getVapidPublicKey(),
    getVapidPrivateKey()
  );

  await Promise.all(
    subscriptions.map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          payload,
          { TTL: 60 * 60 * 12, urgency: "high" }
        );
      } catch (error) {
        const status =
          typeof error === "object" && error && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : 0;
        if (status === 404 || status === 410) {
          await deleteAdminPushSubscription(row.endpoint);
          return;
        }
        console.error("[admin-push] send failed", status || "unknown");
      }
    })
  );
}
