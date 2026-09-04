/**
 * Tests adversariaux — tentatives de contournement documentées.
 * Ne pas supprimer : ils prouvent que les garde-fous résistent aux attaques connues.
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { getSafeAdminNextPath } from "@/lib/admin/safe-next";
import { isBlockedSsrfHost, isSafeHttpUrl } from "@/lib/review-schema";
import { verifyFormRequestOrigin } from "@/lib/security/request-origin";
import { parseJsonBody } from "@/lib/security/parse-json-body";

describe("Adversarial — CSRF via Host header forgé (A01)", () => {
  const envSnapshot = { ...process.env };

  beforeEach(() => {
    process.env = { ...envSnapshot, NODE_ENV: "production", VERCEL: "1" };
    process.env.NEXT_PUBLIC_SITE_URL = "https://vorzix.com";
    delete process.env.FORM_ALLOWED_ORIGINS;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = envSnapshot;
  });

  it("rejette Origin evil.com même si Host/x-forwarded-host sont forgés", () => {
    const request = new Request("https://vorzix.com/api/contact", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        host: "evil.example",
        "x-forwarded-host": "evil.example",
        "x-forwarded-proto": "https",
      },
    });
    assert.equal(verifyFormRequestOrigin(request), false);
  });

  it("n'ajoute pas evil.example aux origines via Host seul", () => {
    const request = new Request("https://vorzix.com/api/contact", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        host: "evil.example",
      },
    });
    assert.equal(verifyFormRequestOrigin(request), false);
  });

  it("autorise uniquement les origines déclarées (site + VERCEL_URL)", () => {
    process.env.VERCEL_URL = "vorzix-git-preview.vercel.app";
    const allowed = new Request("https://vorzix-git-preview.vercel.app/api/contact", {
      method: "POST",
      headers: { origin: "https://vorzix-git-preview.vercel.app" },
    });
    const blocked = new Request("https://vorzix.com/api/contact", {
      method: "POST",
      headers: { origin: "https://random-other.vercel.app" },
    });
    assert.equal(verifyFormRequestOrigin(allowed), true);
    assert.equal(verifyFormRequestOrigin(blocked), false);
  });
});

describe("Adversarial — SSRF URLs publiques (A10)", () => {
  const envSnapshot = { ...process.env };

  afterEach(() => {
    process.env = envSnapshot;
  });

  it("bloque metadata / réseaux privés en production", () => {
    const previous = process.env.NODE_ENV;
    process.env = { ...process.env, NODE_ENV: "production" };
    const blocked = [
      "http://127.0.0.1/admin",
      "http://169.254.169.254/latest/meta-data/",
      "http://10.0.0.5/internal",
      "http://192.168.1.1/",
      "http://metadata.google.internal/",
    ];
    for (const url of blocked) {
      assert.equal(isSafeHttpUrl(url), false, url);
    }
    assert.equal(isSafeHttpUrl("https://vorzix.com"), true);
    process.env = { ...process.env, NODE_ENV: previous };
  });

  it("isBlockedSsrfHost couvre les hôtes sensibles", () => {
    assert.equal(isBlockedSsrfHost("169.254.169.254"), true);
    assert.equal(isBlockedSsrfHost("metadata.google.internal"), true);
    assert.equal(isBlockedSsrfHost("vorzix.com"), false);
  });
});

describe("Adversarial — open redirect admin push SW (A01)", () => {
  it("getSafeAdminNextPath bloque les URLs externes et chemins hors /admin", () => {
    assert.equal(getSafeAdminNextPath("/admin/inquiries"), "/admin/inquiries");
    assert.equal(getSafeAdminNextPath("//evil.com/phish"), null);
    assert.equal(getSafeAdminNextPath("https://evil.com"), null);
    assert.equal(getSafeAdminNextPath("/admin-evil"), null);
    assert.equal(getSafeAdminNextPath("/admin/inquiries\\@evil.com"), null);
  });
});

describe("Adversarial — JSON malveillant (A08)", () => {
  it("rejette pollution prototype via JSON brut", async () => {
    const result = await parseJsonBody(
      new Request("http://localhost/api/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: '{"a":{"b":{"__proto__":{"isAdmin":true}}}}',
      })
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "dangerous_keys");
  });

  it("rejette un corps > 12 Ko", async () => {
    const huge = JSON.stringify({ msg: "x".repeat(20_000) });
    const result = await parseJsonBody(
      new Request("http://localhost/api/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: huge,
      })
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "too_large");
  });
});
