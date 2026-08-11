import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectImageMime } from "@/lib/projects/image-magic";

describe("detectImageMime", () => {
  it("détecte JPEG / PNG / WebP / GIF", () => {
    assert.equal(detectImageMime(Uint8Array.of(0xff, 0xd8, 0xff, 0xe0)), "image/jpeg");
    assert.equal(
      detectImageMime(
        Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
      ),
      "image/png"
    );
    assert.equal(
      detectImageMime(
        Uint8Array.of(
          0x52,
          0x49,
          0x46,
          0x46,
          0,
          0,
          0,
          0,
          0x57,
          0x45,
          0x42,
          0x50
        )
      ),
      "image/webp"
    );
    assert.equal(
      detectImageMime(Uint8Array.from(Buffer.from("GIF89a"))),
      "image/gif"
    );
  });

  it("rejette les payloads non image", () => {
    assert.equal(detectImageMime(Uint8Array.of(1, 2, 3)), null);
    assert.equal(detectImageMime(Uint8Array.from(Buffer.from("<svg"))), null);
  });
});
