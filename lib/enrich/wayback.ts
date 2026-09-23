import type { EnrichmentResult, EnrichmentSource, WebMention } from "./types";

// Wayback Machine CDX API. Given a search term, we ask for archived URLs
// that contain it in the URL or query string. Free, no key needed.
// Docs: https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server

const CDX = "https://web.archive.org/cdx/search/cdx";

export async function waybackLookup(term: string): Promise<Partial<EnrichmentResult>> {
  const source: EnrichmentSource = { provider: "wayback", label: "Wayback Machine", ok: false };
  const start = Date.now();
  // Search URLs that CONTAIN the term (works well for emails / usernames /
  // free-form terms that would appear in query strings).
  const url = `${CDX}?url=*${encodeURIComponent(term)}*&output=json&limit=10&fl=original,timestamp&collapse=urlkey`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 6000);
  try {
    const r = await fetch(url, {
      headers: { "user-agent": "searcher-osint/1.0" },
      signal: controller.signal,
    });
    source.latencyMs = Date.now() - start;
    if (!r.ok) return { sources: [source] };
    const rows = (await r.json().catch(() => [])) as string[][];
    if (!Array.isArray(rows) || rows.length < 2) {
      source.ok = true;
      return { sources: [source], webMentions: [] };
    }
    const [header, ...data] = rows;
    const iOriginal = header.indexOf("original");
    const iTs = header.indexOf("timestamp");
    const mentions: WebMention[] = data.slice(0, 6).map((row) => {
      const original = row[iOriginal];
      const ts = row[iTs];
      const captured =
        ts && ts.length >= 8
          ? `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`
          : undefined;
      return {
        url: original,
        captured,
        archiveUrl: `https://web.archive.org/web/${ts}/${original}`,
      };
    });
    source.ok = true;
    return { sources: [source], webMentions: mentions };
  } catch {
    source.latencyMs = Date.now() - start;
    return { sources: [source] };
  } finally {
    clearTimeout(t);
  }
}
