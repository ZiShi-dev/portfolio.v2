import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readBoundedBody } from "@/lib/security/bounded-body";

function streamed(chunks: Uint8Array[], headers: Record<string, string> = {}, cancel = () => {}) {
  let index = 0;
  return new Request("https://example.com/upload", {
    method: "POST", headers,
    body: new ReadableStream<Uint8Array>({
      pull(controller) { if (index < chunks.length) controller.enqueue(chunks[index++]); else controller.close(); },
      cancel,
    }), duplex: "half",
  } as RequestInit & { duplex: "half" });
}

describe("bounded request body", () => {
  it("accepts the exact byte limit without altering binary data", async () => {
    const result = await readBoundedBody(streamed([new Uint8Array([0, 255]), new Uint8Array([128])]), 3);
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual([...result.bytes], [0, 255, 128]);
  });
  const headerCases: Record<string, string>[] = [{}, { "content-length": "1" }];
  for (const headers of headerCases) {
    it(`cancels an oversized body with headers ${JSON.stringify(headers)}`, async () => {
      let cancelled = false;
      const result = await readBoundedBody(streamed([new Uint8Array(4), new Uint8Array(4), new Uint8Array(4)], headers,
        () => { cancelled = true; }), 6);
      assert.deepEqual(result, { ok: false, reason: "too_large" });
      assert.equal(cancelled, true);
    });
  }
  it("rejects a large declared length without reading the body", async () => {
    assert.deepEqual(await readBoundedBody(new Request("https://example.com", {
      method: "POST", headers: { "content-length": "1000" }, body: "x",
    }), 10), { ok: false, reason: "too_large" });
  });
  it("handles a broken stream without exposing an exception", async () => {
    const request = new Request("https://example.com", { method: "POST", duplex: "half",
      body: new ReadableStream({ start(controller) { controller.error(new Error("broken")); } }),
    } as RequestInit & { duplex: "half" });
    assert.deepEqual(await readBoundedBody(request, 10), { ok: false, reason: "read_failed" });
  });
  it("rejects a body already locked by another reader", async () => {
    const request = new Request("https://example.com", { method: "POST", body: "hello" });
    const lock = request.body!.getReader();
    assert.deepEqual(await readBoundedBody(request, 10), { ok: false, reason: "read_failed" });
    lock.releaseLock();
  });

});
