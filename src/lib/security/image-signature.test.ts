import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchesImageMimeSignature } from "@/lib/security/image-signature";

const PNG_HEADER = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
]);
const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const WEBP_HEADER = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const GIF_HEADER = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

describe("OWASP A04 — image-signature (magic bytes)", () => {
  it("accepte PNG / JPEG / WebP / GIF valides", () => {
    assert.equal(matchesImageMimeSignature(PNG_HEADER, "image/png"), true);
    assert.equal(matchesImageMimeSignature(JPEG_HEADER, "image/jpeg"), true);
    assert.equal(matchesImageMimeSignature(WEBP_HEADER, "image/webp"), true);
    assert.equal(matchesImageMimeSignature(GIF_HEADER, "image/gif"), true);
  });

  it("rejette un polyglot MIME déclaré PNG avec contenu arbitraire", () => {
    assert.equal(matchesImageMimeSignature(new Uint8Array([1, 2, 3]), "image/png"), false);
  });

  it("rejette JPEG déclaré pour un PNG", () => {
    assert.equal(matchesImageMimeSignature(JPEG_HEADER, "image/png"), false);
  });
});
