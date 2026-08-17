import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  isRetryableSupabaseNetworkError,
  supabaseFetch,
} from "@/lib/supabase/fetch";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("supabase fetch", () => {
  it("réessaie une fois sur TypeError fetch failed", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      if (calls === 1) {
        throw new TypeError("fetch failed");
      }
      return new Response("ok", { status: 200 });
    }) as typeof fetch;

    const res = await supabaseFetch("https://example.supabase.co/rest/v1/services");
    assert.equal(calls, 2);
    assert.equal(res.status, 200);
  });

  it("ne réessaie pas un timeout", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      const err = new Error("The operation was aborted");
      err.name = "TimeoutError";
      throw err;
    }) as typeof fetch;

    await assert.rejects(() => supabaseFetch("https://example.supabase.co/rest/v1/"), {
      name: "TimeoutError",
    });
    assert.equal(calls, 1);
  });

  it("détecte un reset TCP comme retryable", () => {
    const err = new TypeError("fetch failed");
    (err as Error & { cause: { code: string } }).cause = { code: "ECONNRESET" };
    assert.equal(isRetryableSupabaseNetworkError(err), true);
  });
});
