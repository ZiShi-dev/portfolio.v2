import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkRateLimitInStore,
  getClientIp,
  pruneRateLimitStore,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from "@/lib/rate-limit-core";

describe("OWASP A04 — rate-limit-core", () => {
  it("getClientIp préfère x-vercel-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.9",
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
        "x-real-ip": "9.9.9.9",
      },
    });
    assert.equal(getClientIp(request), "203.0.113.9");
  });

  it("getClientIp lit x-real-ip avant x-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: {
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
        "x-real-ip": "9.9.9.9",
      },
    });
    assert.equal(getClientIp(request), "9.9.9.9");
  });

  it("getClientIp hors Vercel prend la dernière IP de XFF", () => {
    const prevVercel = process.env.VERCEL;
    const prevEnv = process.env.VERCEL_ENV;
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    try {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      });
      assert.equal(getClientIp(request), "5.6.7.8");
    } finally {
      if (prevVercel === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = prevVercel;
      if (prevEnv === undefined) delete process.env.VERCEL_ENV;
      else process.env.VERCEL_ENV = prevEnv;
    }
  });

  it("getClientIp retombe sur unknown", () => {
    const unknown = new Request("http://localhost");
    assert.equal(getClientIp(unknown), "unknown");
  });

  it("checkRateLimitInStore autorise puis bloque", () => {
    const store = new Map<string, { count: number; resetAt: number }>();
    const key = `ip-${Date.now()}`;
    const now = Date.now();

    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i += 1) {
      const result = checkRateLimitInStore(store, key, now, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS);
      assert.equal(result.allowed, true);
    }

    const blocked = checkRateLimitInStore(store, key, now, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSec && blocked.retryAfterSec > 0);
  });

  it("pruneRateLimitStore nettoie les entrées expirées", () => {
    const store = new Map<string, { count: number; resetAt: number }>();
    store.set("old", { count: 5, resetAt: 1000 });
    store.set("fresh", { count: 1, resetAt: Date.now() + 60_000 });
    pruneRateLimitStore(store, 2000);
    assert.equal(store.has("old"), false);
    assert.equal(store.has("fresh"), true);
  });
});
