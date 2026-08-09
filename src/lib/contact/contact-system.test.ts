import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  countContactSubmissionsInWindow,
  saveContactMessage,
} from "@/lib/contact/messages";

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

describe("contact messages — persistance serveur (sans Supabase live)", () => {
  beforeEach(() => {
    setEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    setEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
  });

  afterEach(restoreEnv);

  it("saveContactMessage échoue si service non configuré", async () => {
    const result = await saveContactMessage({
      name: "Test",
      email: "t@example.com",
      message: "Message de test assez long.",
      fingerprint: "fp-test",
      ip: "127.0.0.1",
    });
    assert.equal(result.ok, false);
  });

  it("countContactSubmissionsInWindow retourne null sans Supabase", async () => {
    const stats = await countContactSubmissionsInWindow({
      since: new Date(Date.now() - 86400000).toISOString(),
      email: "t@example.com",
    });
    assert.equal(stats, null);
  });
});
