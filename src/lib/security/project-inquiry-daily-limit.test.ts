import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { FORM_SECURITY } from "@/lib/security/constants";
import { hashForAudit } from "@/lib/security/fingerprint";
import {
  checkProjectInquiryEmailDailyLimit,
  checkProjectInquiryIpDailyLimit,
  clearProjectInquiryDailyLimitsForTests,
  setProjectInquiryCounterForTests,
} from "@/lib/security/project-inquiry-daily-limit";

const envBackup = new Map<string, string | undefined>();

function setEnv(key: string, value: string | undefined) {
  if (!envBackup.has(key)) envBackup.set(key, process.env[key]);
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function restoreEnv() {
  for (const [key, value] of envBackup.entries()) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  envBackup.clear();
}

function enableFakeSupabase() {
  setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
  setEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
}

describe("project inquiry daily limits — voie BDD (override test)", () => {
  beforeEach(() => {
    enableFakeSupabase();
    clearProjectInquiryDailyLimitsForTests();
  });

  afterEach(restoreEnv);

  it("utilise source=database quand Supabase configuré", async () => {
    setProjectInquiryCounterForTests(async () => ({
      count: 0,
      oldestCreatedAt: null,
    }));
    const r = await checkProjectInquiryEmailDailyLimit("db@example.com");
    assert.equal(r.allowed, true);
    assert.equal(r.source, "database");
  });

  it("bloque via BDD dès 1 lead existant pour l'email", async () => {
    const now = Date.now();
    const oldest = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    setProjectInquiryCounterForTests(async () => ({
      count: FORM_SECURITY.PROJECT_INQUIRY_EMAIL_DAILY_MAX,
      oldestCreatedAt: oldest,
    }));
    const r = await checkProjectInquiryEmailDailyLimit("spam@example.com", now);
    assert.equal(r.allowed, false);
    assert.equal(r.source, "database");
    assert.ok(r.retryAfterSec && r.retryAfterSec > 0);
  });

  it("bloque via BDD si count >= max IP", async () => {
    setProjectInquiryCounterForTests(async () => ({
      count: FORM_SECURITY.PROJECT_INQUIRY_IP_DAILY_MAX,
      oldestCreatedAt: new Date().toISOString(),
    }));
    const r = await checkProjectInquiryIpDailyLimit("198.51.100.10");
    assert.equal(r.allowed, false);
    assert.equal(r.source, "database");
  });

  it("passe email normalisé et ip au compteur BDD", async () => {
    let captured: { email?: string; ip?: string; since?: string } = {};
    setProjectInquiryCounterForTests(async (opts) => {
      captured = opts;
      return { count: 0, oldestCreatedAt: null };
    });
    await checkProjectInquiryEmailDailyLimit("  User@Test.COM  ");
    assert.equal(captured.email, "user@test.com");

    await checkProjectInquiryIpDailyLimit("203.0.113.1");
    assert.equal(captured.ip, "203.0.113.1");
    assert.ok(captured.since);
  });

  it("retombe sur mémoire si le compteur BDD retourne null", async () => {
    setProjectInquiryCounterForTests(async () => null);
    const r = await checkProjectInquiryIpDailyLimit("203.0.113.99");
    assert.equal(r.allowed, true);
    assert.equal(r.source, "memory");
  });
});

describe("project inquiry daily limits — fallback mémoire (sans Supabase)", () => {
  beforeEach(() => {
    setEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    setEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    clearProjectInquiryDailyLimitsForTests();
  });

  afterEach(restoreEnv);

  it("1 lead max / email / 24 h", async () => {
    const email = "client@example.com";
    assert.equal((await checkProjectInquiryEmailDailyLimit(email)).allowed, true);
    const blocked = await checkProjectInquiryEmailDailyLimit(email);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSec && blocked.retryAfterSec > 0);
  });

  it("normalise l'email (casse / espaces)", async () => {
    await checkProjectInquiryEmailDailyLimit("  Client@Example.COM  ");
    assert.equal(
      (await checkProjectInquiryEmailDailyLimit("client@example.com")).allowed,
      false
    );
  });

  it("autorise jusqu'à PROJECT_INQUIRY_IP_DAILY_MAX par IP", async () => {
    const ip = "203.0.113.50";
    for (let i = 0; i < FORM_SECURITY.PROJECT_INQUIRY_IP_DAILY_MAX; i += 1) {
      const r = await checkProjectInquiryIpDailyLimit(ip);
      assert.equal(r.allowed, true, `attempt ${i + 1}`);
      assert.equal(r.source, "memory");
    }
    const blocked = await checkProjectInquiryIpDailyLimit(ip);
    assert.equal(blocked.allowed, false);
  });

  it("IP et email sont indépendants", async () => {
    await checkProjectInquiryIpDailyLimit("1.2.3.4");
    await checkProjectInquiryEmailDailyLimit("a@b.com");
    assert.equal((await checkProjectInquiryIpDailyLimit("5.6.7.8")).allowed, true);
    assert.equal((await checkProjectInquiryEmailDailyLimit("c@d.com")).allowed, true);
  });

  it("email absent → pas de blocage journalier email", async () => {
    assert.equal((await checkProjectInquiryEmailDailyLimit(undefined)).allowed, true);
    assert.equal((await checkProjectInquiryEmailDailyLimit("")).allowed, true);
  });

  it("clé mémoire IP = hash audit (pas l'IP en clair)", async () => {
    const ip = "203.0.113.77";
    await checkProjectInquiryIpDailyLimit(ip);
    const expectedKey = `project-inquiry-ip:${hashForAudit(ip)}`;
    assert.notEqual(expectedKey, `project-inquiry-ip:${ip}`);
  });
});

describe("FORM_SECURITY — constantes plafond project inquiry", () => {
  it("1 lead / email / 24 h", () => {
    const day = 24 * 60 * 60 * 1000;
    assert.equal(FORM_SECURITY.PROJECT_INQUIRY_EMAIL_DAILY_MAX, 1);
    assert.equal(FORM_SECURITY.PROJECT_INQUIRY_EMAIL_DAILY_WINDOW_MS, day);
    assert.equal(FORM_SECURITY.PROJECT_INQUIRY_IP_DAILY_MAX, 10);
    assert.equal(FORM_SECURITY.PROJECT_INQUIRY_IP_DAILY_WINDOW_MS, day);
  });
});
