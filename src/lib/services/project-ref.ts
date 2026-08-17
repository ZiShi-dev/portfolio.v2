/**
 * Résout un slug projet depuis une URL, un chemin ou un slug nu.
 * Ex. https://vorzix.dev/fr/projets/quotishop → quotishop
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseProjectSlugFromInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromUrl = slugFromUrlOrPath(trimmed);
  if (fromUrl) return fromUrl;

  const lower = trimmed.toLowerCase();
  if (SLUG_RE.test(lower)) return lower;
  return null;
}

function slugFromUrlOrPath(value: string): string | null {
  let path = value.trim();

  try {
    const parsed = new URL(path);
    path = parsed.pathname;
  } catch {
    // chemin relatif ou slug
  }

  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const locales = new Set(["fr", "en", "ar"]);
  let start = 0;
  if (locales.has(parts[0]!.toLowerCase())) start = 1;

  const rest = parts.slice(start);
  const folder = rest[0]?.toLowerCase();
  if (folder === "projets" || folder === "projects") {
    const slug = rest[1]?.toLowerCase();
    return slug && SLUG_RE.test(slug) ? slug : null;
  }

  return null;
}
