import type { EnrichmentResult, EnrichmentSource } from "./types";

// GitHub code search. Public repos often contain accidental phone / email
// leaks in config files, contact pages, .env samples, etc. Free API,
// 10 requests/min unauthenticated. Optional GITHUB_TOKEN raises the limit
// to 30/min. We use the search-code endpoint which is restricted to
// authenticated requests — falls back to search-issues for unauthenticated.

const CODE_SEARCH = "https://api.github.com/search/code";
const ISSUE_SEARCH = "https://api.github.com/search/issues";

async function fetchJson(url: string, headers: Record<string, string> = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "searcher-osint/1.0",
        ...headers,
      },
      signal: controller.signal,
    });
    if (!r.ok) return null;
    return await r.json().catch(() => null);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function githubSearch(query: string): Promise<Partial<EnrichmentResult>> {
  const source: EnrichmentSource = { provider: "github-search", label: "GitHub code search", ok: false };
  const start = Date.now();
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = token ? { authorization: `Bearer ${token}` } : {};
  const encoded = encodeURIComponent(`"${query}"`);
  // Prefer code search (needs auth). Fall back to issue/PR search (free).
  const endpoint = token ? CODE_SEARCH : ISSUE_SEARCH;
  const j = (await fetchJson(`${endpoint}?q=${encoded}&per_page=8`, headers)) as
    | { items?: Array<{ html_url: string; path?: string; title?: string; repository?: { full_name?: string } }> }
    | null;
  source.latencyMs = Date.now() - start;
  if (!j || !j.items) return { sources: [source] };
  const hits = j.items.slice(0, 6).map((it) => ({
    site: it.repository?.full_name ? `github.com/${it.repository.full_name}` : "github.com",
    url: it.html_url,
    icon: "github",
  }));
  source.ok = true;
  return { sources: [source], githubMentions: hits };
}
