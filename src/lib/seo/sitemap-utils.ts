/** Dates sitemap : Next sérialise via toISOString() — une Invalid Date fait un 500. */
export function parseSitemapDate(value: unknown): Date | undefined {
  if (value == null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Images sitemap : URLs http(s) uniques, relatives résolues. */
export function uniqueAbsoluteHttpUrls(
  urls: Array<string | null | undefined>,
  toAbsolute: (path: string) => string
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of urls) {
    if (!raw || typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    let absolute: string;
    try {
      absolute = /^https?:\/\/./i.test(trimmed)
        ? trimmed
        : toAbsolute(trimmed);
    } catch {
      continue;
    }

    try {
      const parsed = new URL(absolute);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        continue;
      }
    } catch {
      continue;
    }

    if (seen.has(absolute)) continue;
    seen.add(absolute);
    out.push(absolute);
  }

  return out;
}
