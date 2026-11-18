import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";

describe("GET /api/cron/push-outbox", () => {
  let route: typeof import("@/app/api/cron/push-outbox/route");
  const previous = process.env.CRON_SECRET;

  before(() => {
    process.env.CRON_SECRET = "secret-valeur";
    mock.module("@/lib/admin/push/outbox", {
      namedExports: {
        processPushOutbox: async () => ({
          unavailable: false,
          claimed: 1,
          sent: 1,
          retry: 0,
          dead: 0,
        }),
        scheduleInquiryPush: () => undefined,
      },
    });
  });

  before(async () => {
    route = await import("@/app/api/cron/push-outbox/route");
  });

  after(() => {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
    mock.reset();
  });

  it("refuse un appel sans le secret", async () => {
    const response = await route.GET(
      new Request("http://localhost/api/cron/push-outbox")
    );
    assert.equal(response.status, 401);
    const body = await response.text();
    assert.equal(body.includes("secret-valeur"), false);
  });

  it("accepte un GET externe et ne révèle pas le secret", async () => {
    const logged: string[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      logged.push(args.map((part) => String(part)).join(" "));
    };
    try {
      const ok = await route.GET(
        new Request("http://localhost/api/cron/push-outbox", {
          headers: { authorization: "Bearer secret-valeur" },
        })
      );
      const wrong = await route.GET(
        new Request("http://localhost/api/cron/push-outbox", {
          headers: { authorization: "Bearer autre-jeton" },
        })
      );
      const okBody = await ok.text();
      const wrongBody = await wrong.text();
      assert.equal(ok.status, 200);
      assert.equal(wrong.status, 401);
      assert.equal(okBody.includes("secret-valeur"), false);
      assert.equal(wrongBody.includes("secret-valeur"), false);
      assert.equal(wrongBody.includes("autre-jeton"), false);
      assert.equal(logged.some((line) => line.includes("secret-valeur")), false);
      assert.equal(logged.some((line) => line.includes("autre-jeton")), false);
    } finally {
      console.error = original;
    }
  });
});
