import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";

describe("API admin push + résumé notifications", () => {
  let guardOk = true;
  let configured = true;
  let vapidRoute: typeof import("@/app/api/admin/push/vapid/route");
  let summaryRoute: typeof import("@/app/api/admin/notifications/summary/route");
  let readRoute: typeof import("@/app/api/admin/notifications/read/route");

  before(() => {
    mock.module("@/lib/admin/require-admin-api", {
      namedExports: {
        requireAdminApi: async () =>
          guardOk
            ? { ok: true as const, user: { id: "u", email: "a@b.c" } }
            : {
                ok: false as const,
                response: Response.json(
                  { code: ADMIN_ERROR_CODES.SESSION_EXPIRED },
                  { status: 401 }
                ),
              },
      },
    });
    mock.module("@/lib/admin/push/vapid", {
      namedExports: {
        isWebPushConfigured: () => configured,
        getVapidPublicKey: () => "public-test-key",
      },
    });
    mock.module("@/lib/project-inquiry/store", {
      namedExports: {
        countNewProjectInquiries: async () => 1,
        listUnseenNewProjectInquiries: async () => [
          {
            id: "1",
            reference: "VZ—LEAD 004",
            name: "Alex",
            createdAt: "2026-08-17T15:00:00.000Z",
          },
        ],
        markNewProjectInquiriesSeen: async () => 1,
      },
    });
  });

  before(async () => {
    vapidRoute = await import("@/app/api/admin/push/vapid/route");
    summaryRoute = await import("@/app/api/admin/notifications/summary/route");
    readRoute = await import("@/app/api/admin/notifications/read/route");
  });

  after(() => mock.reset());

  it("refuse la clé VAPID sans session", async () => {
    guardOk = false;
    const res = await vapidRoute.GET(
      new Request("http://localhost/api/admin/push/vapid")
    );
    assert.equal(res.status, 401);
  });

  it("expose la clé publique si configuré", async () => {
    guardOk = true;
    configured = true;
    const res = await vapidRoute.GET(
      new Request("http://localhost/api/admin/push/vapid")
    );
    assert.equal(res.status, 200);
    const body = (await res.json()) as { configured?: boolean; publicKey?: string };
    assert.equal(body.configured, true);
    assert.equal(body.publicKey, "public-test-key");
  });

  it("compte les nouvelles demandes", async () => {
    guardOk = true;
    const res = await summaryRoute.GET(
      new Request("http://localhost/api/admin/notifications/summary")
    );
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      newInquiries?: number;
      items?: { reference?: string }[];
    };
    assert.equal(body.newInquiries, 1);
    assert.equal(body.items?.length, 1);
    assert.equal(body.items?.[0]?.reference, "VZ—LEAD 004");
  });

  it("marque les notifications comme lues", async () => {
    guardOk = true;
    const res = await readRoute.POST(
      new Request("http://localhost/api/admin/notifications/read", {
        method: "POST",
      })
    );
    assert.equal(res.status, 200);
    const body = (await res.json()) as { marked?: number };
    assert.equal(body.marked, 1);
  });
});
