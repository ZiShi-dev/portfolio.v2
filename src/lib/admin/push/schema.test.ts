import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInquiryPushPayload,
  parsePushSubscriptionBody,
} from "@/lib/admin/push/schema";

describe("admin push schema", () => {
  it("accepte un abonnement HTTPS", () => {
    const parsed = parsePushSubscriptionBody({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      keys: { p256dh: "p256dh-key-value", auth: "auth-secret" },
    });
    assert.equal(parsed.ok, true);
  });

  it("refuse un endpoint non HTTPS", () => {
    const parsed = parsePushSubscriptionBody({
      endpoint: "http://evil.example/push",
      keys: { p256dh: "p256dh-key-value", auth: "auth-secret" },
    });
    assert.equal(parsed.ok, false);
  });

  it("le payload de demande n'expose pas d'email", () => {
    const payload = buildInquiryPushPayload({
      reference: "VZ—LEAD 012",
      name: "Alex Martin",
    });
    assert.equal(payload.url, "/admin/inquiries");
    assert.match(payload.body, /VZ—LEAD 012/);
    assert.match(payload.body, /Alex Martin/);
    assert.equal(payload.body.includes("@"), false);
  });
});
