export type BoundedBodyResult =
  | { ok: true; bytes: Uint8Array<ArrayBuffer> }
  | { ok: false; reason: "too_large" | "read_failed" };

/** Enforce the actual byte limit, including chunked bodies and misleading headers. */
export async function readBoundedBody(request: Request, maxBytes: number): Promise<BoundedBodyResult> {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > maxBytes) return { ok: false, reason: "too_large" };
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try { reader = request.body?.getReader(); }
  catch { return { ok: false, reason: "read_failed" }; }
  if (!reader) return { ok: true, bytes: new Uint8Array(0) };
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        // Cancellation errors must not turn a size rejection into a server error.
        try { await reader.cancel(); } catch { /* The stream is already unusable. */ }
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
    const single = chunks[0];
    if (chunks.length === 1 && single.buffer instanceof ArrayBuffer) {
      return { ok: true, bytes: new Uint8Array(single.buffer, single.byteOffset, single.byteLength) };
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { ok: true, bytes };
  } catch {
    return { ok: false, reason: "read_failed" };
  } finally {
    reader.releaseLock();
  }
}
