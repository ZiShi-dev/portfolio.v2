import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import { parseAdminPasswordChangeBody } from "@/lib/admin/password-change-schema";

describe("parseAdminPasswordChangeBody — OWASP password change", () => {
  const strong = "Str0ng!Passw0rd";

  it("accepte un changement valide", () => {
    const result = parseAdminPasswordChangeBody({
      currentPassword: "oldpassword1",
      newPassword: strong,
      confirmPassword: strong,
      _honeypot: "",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.newPassword, strong);
      assert.equal(result.data.currentPassword, "oldpassword1");
    }
  });

  it("rejette honeypot", () => {
    const result = parseAdminPasswordChangeBody({
      currentPassword: "oldpassword1",
      newPassword: strong,
      confirmPassword: strong,
      _honeypot: "bot",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "honeypot");
  });

  it("rejette tableau / non-objet", () => {
    assert.equal(parseAdminPasswordChangeBody([]).ok, false);
    assert.equal(parseAdminPasswordChangeBody(null).ok, false);
  });

  it("rejette confirmation différente", () => {
    const result = parseAdminPasswordChangeBody({
      currentPassword: "oldpassword1",
      newPassword: strong,
      confirmPassword: "Str0ng!Passw0rdX",
    });
    assert.equal(result.ok, false);
  });

  it("rejette nouveau = actuel", () => {
    const result = parseAdminPasswordChangeBody({
      currentPassword: strong,
      newPassword: strong,
      confirmPassword: strong,
    });
    assert.equal(result.ok, false);
  });

  it("rejette mot de passe faible", () => {
    const weaks = [
      "short1!",
      "nouppercase1!",
      "NOLOWERCASE1!",
      "NoDigits!!!!",
      "NoSpecial1234",
    ];
    for (const newPassword of weaks) {
      const result = parseAdminPasswordChangeBody({
        currentPassword: "oldpassword1",
        newPassword,
        confirmPassword: newPassword,
      });
      assert.equal(result.ok, false, newPassword);
    }
  });
});

describe("API admin password — confirmation de la révocation", () => {
  let route: typeof import("@/app/api/admin/password/route");
  let revocation: "ok" | "error" | "throw";
  const calls: string[] = [];
  const user = { id: "admin-test", email: "admin@example.test" };

  before(async () => {
    mock.module("@/lib/admin/allowlist", {
      namedExports: { isAllowedAdminEmail: () => true, isAdminConfigured: () => true },
    });
    mock.module("@/lib/supabase/config", {
      namedExports: { isSupabaseConfigured: () => true },
    });
    mock.module("@/lib/security/request-origin", {
      namedExports: { verifyAdminRequestOrigin: () => true },
    });
    mock.module("@/lib/admin/mfa", {
      namedExports: { hasAdminMfaSatisfied: async () => true },
    });
    mock.module("@/lib/admin/audit-log", {
      namedExports: { logAdminAuthEvent: (event: string) => calls.push(event) },
    });
    mock.module("@/lib/supabase/ephemeral", {
      namedExports: {
        createSupabaseEphemeralClient: () => ({
          auth: {
            signInWithPassword: async () => ({ data: { user }, error: null }),
            signOut: async ({ scope }: { scope: string }) => calls.push(scope),
          },
        }),
      },
    });
    mock.module("@/lib/supabase/server", {
      namedExports: {
        createSupabaseServerClient: async () => ({
          auth: {
            getUser: async () => ({ data: { user }, error: null }),
            updateUser: async () => {
              calls.push("update");
              return { error: null };
            },
            signOut: async ({ scope }: { scope: string }) => {
              calls.push(scope);
              if (revocation === "throw") throw new Error("Network unavailable");
              return { error: revocation === "error" ? { code: "unavailable" } : null };
            },
          },
        }),
      },
    });
    route = await import("@/app/api/admin/password/route");
  });

  after(() => mock.restoreAll());

  for (const outcome of ["ok", "error", "throw"] as const) {
    it(`distingue la mise à jour du mot de passe de la révocation (${outcome})`, async () => {
      calls.length = 0;
      revocation = outcome;
      const response = await route.POST(new Request("https://example.test/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: "oldpassword1",
          newPassword: "Str0ng!Passw0rd",
          confirmPassword: "Str0ng!Passw0rd",
        }),
      }));
      const body = await response.json();
      if (outcome === "ok") {
        assert.equal(response.status, 200);
        assert.equal(body.ok, true);
        assert.deepEqual(calls, ["local", "update", "global", "password_change_success"]);
      } else {
        assert.equal(response.status, 502);
        assert.equal(body.code, ADMIN_ERROR_CODES.PASSWORD_CHANGED_REVOCATION_FAILED);
        assert.equal(body.redirectTo, undefined);
        assert.deepEqual(calls, ["local", "update", "global", "password_change_session_revocation_failed"]);
      }
    });
  }
});
