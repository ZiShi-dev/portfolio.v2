import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInquiryPushPayload,
  parsePushSubscriptionBody,
  isAllowedPushEndpoint,
  pushTopicForInquiry,
  selectPushRecipients,
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

  it("le payload de demande n'expose ni nom ni email", () => {
    const id = "123e4567-e89b-42d3-a456-426614174000";
    const payload = buildInquiryPushPayload({ id, locale: "ar" });
    assert.equal(payload.title, "طلب مشروع جديد");
    assert.equal(payload.body, "وصل طلب جديد لإنشاء مشروع. اضغط لعرض التفاصيل.");
    assert.equal(payload.url, `/admin/inquiries?id=${id}`);
    assert.equal(payload.tag, `inquiry-${id}`);
    assert.equal(payload.body.includes("@"), false);
    assert.equal(payload.body.includes("Alex"), false);
  });

  it("ignore un identifiant de demande invalide", () => {
    const payload = buildInquiryPushPayload({
      id: "pas-un-uuid",
      locale: "fr",
    });
    assert.equal(payload.url, "/admin/inquiries");
    assert.equal(payload.tag, "vorzix-inquiry");
    assert.equal(payload.id, null);
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

describe("destinataires et sujet push", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";

  it("produit un sujet de 32 caractères pour dédupliquer un renvoi", () => {
    const topic = pushTopicForInquiry(id);
    assert.equal(topic, "123e4567e89b42d3a456426614174000");
    assert.equal(topic?.length, 32);
  });

  it("n'envoie qu'aux administrateurs encore autorisés", () => {
    const rows = [
      { admin_email: "admin@vorzix.com", endpoint: "a" },
      { admin_email: "ancien@vorzix.com", endpoint: "b" },
    ];
    const selected = selectPushRecipients(rows, {
      allowlistConfigured: true,
      isAllowed: (email) => email === "admin@vorzix.com",
    });
    assert.deepEqual(selected.deliver.map((row) => row.endpoint), ["a"]);
    assert.deepEqual(selected.revoke.map((row) => row.endpoint), ["b"]);
  });

  it("ne supprime personne si la liste blanche est absente", () => {
    const selected = selectPushRecipients(
      [{ admin_email: "admin@vorzix.com" }],
      { allowlistConfigured: false, isAllowed: () => false }
    );
    assert.equal(selected.deliver.length, 0);
    assert.equal(selected.revoke.length, 0);
  });
});
