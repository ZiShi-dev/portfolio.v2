import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import {
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_CONTACT_PRIORITY,
  DEFAULT_SITE_SETTINGS,
} from "@/data/site-social";

type MockResult = {
  data?: unknown;
  error?: { code?: string; message?: string } | null;
};

function createClient(
  resolver: (op: {
    table: string;
    method: "select" | "upsert";
    payload?: unknown;
  }) => MockResult
) {
  let table = "";
  let method: "select" | "upsert" = "select";
  let payload: unknown;

  const finish = () => resolver({ table, method, payload });
  const api: Record<string, unknown> = {};
  const chain = () => api;

  api.from = (t: string) => {
    table = t;
    payload = undefined;
    method = "select";
    return chain();
  };
  api.upsert = (row: unknown) => {
    method = "upsert";
    payload = row;
    return chain();
  };
  api.select = () => chain();
  api.eq = () => chain();
  api.maybeSingle = async () => finish();
  api.single = async () => finish();

  return api;
}

describe("social/store — settings email + réseaux", () => {
  let configured = true;
  let resultQueue: MockResult[] = [];
  let lastOps: Array<{
    table: string;
    method: string;
    payload?: unknown;
  }> = [];
  let store: typeof import("@/lib/social/store");

  before(() => {
    mock.module("@/lib/supabase/service", {
      namedExports: {
        isSupabaseServiceConfigured: () => configured,
        createSupabaseServiceClient: () => {
          if (!configured) return null;
          return createClient((op) => {
            lastOps.push({ ...op });
            return resultQueue.shift() ?? { data: null, error: null };
          });
        },
      },
    });
  });

  before(async () => {
    store = await import("@/lib/social/store");
  });

  after(() => mock.reset());

  beforeEach(() => {
    configured = true;
    resultQueue = [];
    lastOps = [];
  });

  it("getSiteSettings → défauts si non configuré", async () => {
    configured = false;
    const settings = await store.getSiteSettings();
    assert.deepEqual(settings, DEFAULT_SITE_SETTINGS);
  });

  it("getSiteSettings mappe contact_email + réseaux + priorité", async () => {
    resultQueue.push({
      data: {
        contact_email: "Hello@Zishi.dev",
        discord: "https://discord.gg/x",
        whatsapp: "",
        instagram: "https://www.instagram.com/x",
        tiktok: "",
        contact_priority: ["instagram", "whatsapp"],
      },
    });
    const settings = await store.getSiteSettings();
    assert.equal(settings.contactEmail, "hello@zishi.dev");
    assert.equal(settings.discord, "https://discord.gg/x");
    assert.equal(settings.whatsapp, "");
    assert.deepEqual(settings.contactPriority, [
      "instagram",
      "whatsapp",
      "discord",
      "tiktok",
    ]);
  });

  it("getSiteSettings complète une priorité absente ou invalide", async () => {
    resultQueue.push({
      data: {
        contact_email: "a@b.co",
        discord: "",
        whatsapp: "",
        instagram: "",
        tiktok: "",
        contact_priority: ["email", "nope"],
      },
    });
    const settings = await store.getSiteSettings();
    assert.deepEqual(settings.contactPriority, [
      ...DEFAULT_CONTACT_PRIORITY,
    ]);
  });

  it("getSiteSettings retombe sur les colonnes connues si contact_priority manque", async () => {
    resultQueue.push({
      error: { code: "42703", message: 'column "contact_priority" does not exist' },
    });
    resultQueue.push({
      data: {
        contact_email: "a@b.co",
        discord: "https://discord.gg/x",
        whatsapp: "",
        instagram: "",
        tiktok: "",
      },
    });
    const settings = await store.getSiteSettings();
    assert.equal(settings.discord, "https://discord.gg/x");
    assert.deepEqual(settings.contactPriority, [...DEFAULT_CONTACT_PRIORITY]);
  });

  it("getPublicContactEmail fallback si email BDD invalide", async () => {
    resultQueue.push({
      data: {
        contact_email: "not-an-email",
        discord: "",
        whatsapp: "",
        instagram: "",
        tiktok: "",
      },
    });
    const email = await store.getPublicContactEmail();
    assert.equal(email, DEFAULT_CONTACT_EMAIL);
  });

  it("getSiteSocialLinks omet contactEmail", async () => {
    resultQueue.push({
      data: {
        contact_email: "a@b.co",
        discord: "https://discord.gg/z",
        whatsapp: "",
        instagram: "",
        tiktok: "",
      },
    });
    const links = await store.getSiteSocialLinks();
    assert.equal("contactEmail" in links, false);
    assert.equal(links.discord, "https://discord.gg/z");
  });

  it("upsert écrit contact_email + contact_priority snake_case", async () => {
    resultQueue.push({
      data: {
        contact_email: "new@zishi.dev",
        discord: "",
        whatsapp: "",
        instagram: "",
        tiktok: "",
        contact_priority: ["discord", "whatsapp", "instagram", "tiktok"],
        updated_at: "2026-07-16T00:00:00Z",
      },
    });
    const saved = await store.upsertSiteSocialLinks({
      ...DEFAULT_SITE_SETTINGS,
      contactEmail: "new@zishi.dev",
      contactPriority: ["discord"],
    });
    assert.equal(saved.ok, true);
    assert.equal(lastOps[0]?.method, "upsert");
    const row = lastOps[0]?.payload as {
      contact_email?: string;
      contact_priority?: string[];
    };
    assert.equal(row.contact_email, "new@zishi.dev");
    assert.deepEqual(row.contact_priority, [
      "discord",
      "whatsapp",
      "instagram",
      "tiktok",
    ]);
    assert.deepEqual(saved.ok ? saved.settings.contactPriority : null, [
      "discord",
      "whatsapp",
      "instagram",
      "tiktok",
    ]);
  });

  it("upsert retombe sans contact_priority si la colonne manque", async () => {
    resultQueue.push({
      error: {
        code: "PGRST204",
        message: "Could not find the 'contact_priority' column",
      },
    });
    resultQueue.push({
      data: {
        contact_email: "new@zishi.dev",
        discord: "",
        whatsapp: "",
        instagram: "",
        tiktok: "",
        updated_at: "2026-07-16T00:00:00Z",
      },
    });
    const saved = await store.upsertSiteSocialLinks({
      ...DEFAULT_SITE_SETTINGS,
      contactEmail: "new@zishi.dev",
    });
    assert.equal(saved.ok, true);
    assert.equal(lastOps.length, 2);
    const retry = lastOps[1]?.payload as { contact_priority?: string[] };
    assert.equal("contact_priority" in retry, false);
  });

  it("getSiteSettingsForAdmin → configured false sans service", async () => {
    configured = false;
    const admin = await store.getSiteSettingsForAdmin();
    assert.equal(admin.ok, true);
    if (admin.ok) assert.equal(admin.configured, false);
  });
});
