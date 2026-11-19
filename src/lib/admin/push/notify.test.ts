import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import type { PushSendInput } from "@/lib/admin/push/notify";

const INQUIRY_ID = "123e4567-e89b-42d3-a456-426614174000";

describe("envoi des notifications de demande", () => {
  const deleted: string[] = [];
  let configured = true;
  let rows: Array<{
    id: string;
    admin_email: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    locale: "fr" | "en" | "ar";
  }> | null = [];
  let notify: typeof import("@/lib/admin/push/notify").notifyAdminsOfNewInquiry;
  const previousAllow = process.env.ADMIN_ALLOWED_EMAILS;

  before(() => {
    mock.module("@/lib/admin/push/vapid", {
      namedExports: {
        isWebPushConfigured: () => configured,
        getVapidPublicKey: () => "public-test-key",
        getVapidPrivateKey: () => "private-test-key",
        getVapidSubject: () => "mailto:admin@localhost",
      },
    });
    mock.module("@/lib/admin/push/store", {
      namedExports: {
        listAdminPushSubscriptions: async () => rows,
        deleteAdminPushSubscription: async (endpoint: string) => {
          deleted.push(endpoint);
        },
      },
    });
  });

  before(async () => {
    ({ notifyAdminsOfNewInquiry: notify } = await import("@/lib/admin/push/notify"));
  });

  beforeEach(() => {
    deleted.length = 0;
    configured = true;
    rows = [];
    process.env.ADMIN_ALLOWED_EMAILS = "admin@vorzix.com";
  });

  after(() => {
    if (previousAllow === undefined) delete process.env.ADMIN_ALLOWED_EMAILS;
    else process.env.ADMIN_ALLOWED_EMAILS = previousAllow;
    mock.reset();
  });

  function row(
    endpoint: string,
    email = "admin@vorzix.com",
    locale: "fr" | "en" | "ar" = "fr"
  ) {
    return {
      id: endpoint,
      admin_email: email,
      endpoint,
      p256dh: "p256dh-key-value",
      auth: "auth-secret",
      locale,
    };
  }

  it("réessaie si le registre des abonnements est indisponible", async () => {
    const sender = async () => assert.fail("Un envoi requiert un abonnement");
    rows = null;
    assert.equal(await notify({ id: INQUIRY_ID }, sender), "retry");
    rows = [];
    assert.equal(await notify({ id: INQUIRY_ID }, sender), "sent");
  });

  it("prévient chaque appareil autorisé une seule fois par demande", async () => {
    rows = [
      row("https://fcm.googleapis.com/fcm/send/phone"),
      row("https://fcm.googleapis.com/fcm/send/laptop"),
    ];
    const sent: PushSendInput[] = [];
    await notify({ id: INQUIRY_ID }, async (input) => {
      sent.push(input);
    });
    assert.equal(sent.length, 2);
    assert.equal(sent[0]?.topic, "123e4567e89b42d3a456426614174000");
    const payload = JSON.parse(sent[0]?.payload ?? "{}") as { body?: string };
    assert.equal(payload.body?.includes("@"), false);
    assert.equal(deleted.length, 0);
  });

  it("retire un abonnement mort sans interrompre les autres", async () => {
    rows = [
      row("https://fcm.googleapis.com/fcm/send/dead"),
      row("https://fcm.googleapis.com/fcm/send/live"),
    ];
    const sent: string[] = [];
    await notify({ id: INQUIRY_ID }, async (input) => {
      sent.push(input.endpoint);
      if (input.endpoint.endsWith("/dead")) {
        const error = new Error("gone") as Error & { statusCode: number };
        error.statusCode = 410;
        throw error;
      }
    });
    assert.deepEqual(sent.sort(), [
      "https://fcm.googleapis.com/fcm/send/dead",
      "https://fcm.googleapis.com/fcm/send/live",
    ]);
    assert.deepEqual(deleted, ["https://fcm.googleapis.com/fcm/send/dead"]);
  });

  it("n'écrit pas à un compte qui n'est plus administrateur", async () => {
    rows = [
      row("https://fcm.googleapis.com/fcm/send/keep"),
      row("https://fcm.googleapis.com/fcm/send/old", "ancien@vorzix.com"),
    ];
    const sent: string[] = [];
    await notify({ id: INQUIRY_ID }, async (input) => {
      sent.push(input.endpoint);
    });
    assert.deepEqual(sent, ["https://fcm.googleapis.com/fcm/send/keep"]);
    assert.deepEqual(deleted, ["https://fcm.googleapis.com/fcm/send/old"]);
  });

  it("ne contacte personne et ne vide pas les abonnements si la liste blanche est vide", async () => {
    process.env.ADMIN_ALLOWED_EMAILS = "";
    rows = [row("https://fcm.googleapis.com/fcm/send/phone")];
    let calls = 0;
    await notify({ id: INQUIRY_ID }, async () => {
      calls += 1;
    });
    assert.equal(calls, 0);
    assert.equal(deleted.length, 0);
  });

  it("reste silencieux si le push n'est pas configuré", async () => {
    configured = false;
    rows = [row("https://fcm.googleapis.com/fcm/send/phone")];
    let calls = 0;
    await notify({ id: INQUIRY_ID }, async () => {
      calls += 1;
    });
    assert.equal(calls, 0);
  });
});
