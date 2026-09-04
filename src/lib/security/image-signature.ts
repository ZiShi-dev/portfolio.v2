/** Signatures magic bytes pour validation upload (OWASP A04 — intégrité fichier). */

type SignatureRule = {
  mime: string;
  /** Offset 0 = début du fichier. */
  bytes: number[];
  offset?: number;
};

const RULES: SignatureRule[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
];

function matchesAt(buffer: Uint8Array, bytes: number[], offset: number): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

/** Vérifie que le contenu correspond au MIME déclaré (anti polyglot / spoof). */
export function matchesImageMimeSignature(
  buffer: Uint8Array,
  mime: string
): boolean {
  if (mime === "image/webp") {
    return (
      matchesAt(buffer, [0x52, 0x49, 0x46, 0x46], 0) &&
      matchesAt(buffer, [0x57, 0x45, 0x42, 0x50], 8)
    );
  }

  const rule = RULES.find((entry) => entry.mime === mime);
  if (!rule) return false;
  return matchesAt(buffer, rule.bytes, rule.offset ?? 0);
}
