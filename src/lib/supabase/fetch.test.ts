import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  isRetryableSupabaseNetworkError,
  supabaseFetch,
  publicSupabaseFetch,
} from "@/lib/supabase/fetch";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("supabase fetch", () => {
  it("caches only opted-in public GET requests with an invalidatable 60s tag", async () => {
    const captured: RequestInit[] = [];
    globalThis.fetch = (async (_input, init) => {
      captured.push(init ?? {});
      return new Response("[]");
    }) as typeof fetch;
    const publicRead = publicSupabaseFetch("public:projects");
    await publicRead("https://example.supabase.co/rest/v1/projects?published=eq.true");
    await publicRead("https://example.supabase.co/rest/v1/projects", { method: "PATCH", body: "{}" });
    await supabaseFetch("https://example.supabase.co/rest/v1/projects");
    assert.equal(captured[0].cache, "force-cache");
    assert.deepEqual((captured[0] as RequestInit & { next: unknown }).next, { revalidate: 60, tags: ["public:projects"] });
    assert.equal(captured[1].cache, undefined);
    assert.equal(captured[2].cache, undefined);
  });

  it("honours the method of a Request object before enabling public caching", async () => {
    let cached: RequestCache | undefined;
    globalThis.fetch = (async (_input, init) => {
      cached = init?.cache;
      return new Response("ok");
    }) as typeof fetch;
    await publicSupabaseFetch("public:settings")(new Request("https://example.supabase.co/rest/v1/site_social_links", { method: "POST", body: "{}" }));
    assert.equal(cached, undefined);
  });
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
