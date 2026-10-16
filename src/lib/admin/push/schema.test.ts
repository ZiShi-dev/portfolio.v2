import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInquiryPushPayload,
  parsePushSubscriptionBody,
  isAllowedPushEndpoint,
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

describe("push endpoint SSRF protection", () => {
  for (const endpoint of [
    "https://fcm.googleapis.com/fcm/send/abc", "https://updates.push.services.mozilla.com/wpush/v2/token",
    "https://web.push.apple.com/token", "https://wns2.notify.windows.com/token",
  ]) it(`accepts browser push provider ${new URL(endpoint).hostname}`, () => assert.equal(isAllowedPushEndpoint(endpoint), true));
  for (const endpoint of [
    "http://localhost.evil.example/push", "http://localhost:8080/push", "https://127.0.0.1/push",
    "https://[::1]/push", "https://169.254.169.254/latest/meta-data/", "https://10.0.0.1/push",
    "https://fcm.googleapis.com.evil.example/push", "https://fcm.googleapis.com@evil.example/push",
    "https://user:password@fcm.googleapis.com/push", "https://fcm.googleapis.com:8443/push",
    "https://evil.example/push", "file:///etc/passwd",
  ]) it(`rejects unsafe endpoint ${endpoint}`, () => assert.equal(isAllowedPushEndpoint(endpoint), false));
});
