import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";

describe("admin page authorization boundary", () => {
  let configured = true;
  let user: { id: string; email: string } | null = null;
  let allowed = true;
  let mfa = false;
  let factor = true;
  let guard: typeof import("@/lib/admin/require-admin-page").requireAdminPageUser;
  before(async () => {
    mock.module("next/navigation", { namedExports: { redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } } });
    mock.module("@/lib/supabase/config", { namedExports: { isSupabaseConfigured: () => configured } });
    mock.module("@/lib/supabase/server", { namedExports: { createSupabaseServerClient: async () => ({ auth: {
      getUser: async () => ({ data: { user }, error: null }),
    } }) } });
    mock.module("@/lib/admin/allowlist", { namedExports: { isAllowedAdminEmail: () => allowed } });
    mock.module("@/lib/admin/mfa", { namedExports: {
      hasAdminMfaSatisfied: async () => mfa, adminHasVerifiedTotp: async () => factor,
    } });
    guard = (await import("@/lib/admin/require-admin-page")).requireAdminPageUser;
  });
  beforeEach(() => { configured = true; user = { id: "u", email: "admin@example.com" }; allowed = true; mfa = true; factor = true; });
  after(() => mock.reset());
  it("rejects an unavailable authentication service", async () => { configured = false; await assert.rejects(guard(), /REDIRECT:\/admin\/connexion$/); });
  it("rejects a missing session", async () => { user = null; await assert.rejects(guard(), /REDIRECT:\/admin\/connexion$/); });
  it("rejects a user outside the admin allowlist", async () => { allowed = false; await assert.rejects(guard(), /REDIRECT:\/admin\/connexion$/); });
  it("requires MFA even when called without the proxy", async () => { mfa = false; await assert.rejects(guard(), /step=mfa$/); });
  it("requires enrollment when no factor is present", async () => { mfa = false; factor = false; await assert.rejects(guard(), /step=enroll$/); });
  it("allows an authenticated administrator after MFA", async () => { assert.deepEqual(await guard(), user); });
});
