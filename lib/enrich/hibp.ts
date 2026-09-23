import type { BreachHit, EnrichmentResult, EnrichmentSource } from "./types";

// Breach exposure lookup.
//
// Two providers, whichever is available:
// 1) HIBP paid ($4/mo) — set HIBP_API_KEY. Best data.
// 2) XposedOrNot (xposedornot.com) — free, no key. Returns breach names.
//
// Both return the same shape via BreachHit[]. If neither returns data, we
// still emit a source row so the UI can show "checked and found nothing".

const HIBP_URL = "https://haveibeenpwned.com/api/v3/breachedaccount";
const XPOSED_URL = "https://api.xposedornot.com/v1/check-email";

async function fetchJson(url: string, headers: Record<string, string> = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: { "user-agent": "searcher-osint/1.0", ...headers },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!r.ok) return { status: r.status, body: null as unknown };
    const body = await r.json().catch(() => null);
    return { status: r.status, body };
  } catch {
    return { status: 0, body: null };
  } finally {
    clearTimeout(t);
  }
}

async function viaHibp(email: string): Promise<Partial<EnrichmentResult> | null> {
  const key = process.env.HIBP_API_KEY;
  if (!key) return null;
  const source: EnrichmentSource = { provider: "hibp", label: "Have I Been Pwned", ok: false };
  const start = Date.now();
  const { status, body } = await fetchJson(
    `${HIBP_URL}/${encodeURIComponent(email)}?truncateResponse=false`,
    { "hibp-api-key": key },
  );
  source.latencyMs = Date.now() - start;
  if (status === 404) {
    source.ok = true;
    return { sources: [source], breachCount: 0, breaches: [] };
  }
  if (status !== 200 || !Array.isArray(body)) return { sources: [source] };
  const breaches: BreachHit[] = (body as Array<{
    Name: string;
    Domain?: string;
    BreachDate?: string;
    DataClasses?: string[];
    LogoPath?: string;
  }>).map((b) => ({
    name: b.Name,
    domain: b.Domain,
    date: b.BreachDate,
    dataClasses: b.DataClasses,
    logoUrl: b.LogoPath,
  }));
  source.ok = true;
  return { sources: [source], breachCount: breaches.length, breaches };
}

async function viaXposed(email: string): Promise<Partial<EnrichmentResult>> {
  const source: EnrichmentSource = { provider: "xposedornot", label: "XposedOrNot", ok: false };
  const start = Date.now();
  const { status, body } = await fetchJson(`${XPOSED_URL}/${encodeURIComponent(email)}`);
  source.latencyMs = Date.now() - start;
  if (status === 404) {
    // Their API returns 404 for a clean email — treat as "checked, none found"
    source.ok = true;
    return { sources: [source], breachCount: 0, breaches: [] };
  }
  if (status !== 200 || !body) return { sources: [source] };
  const parsed = body as { breaches?: Array<Array<string>> };
  const names = parsed?.breaches?.[0] ?? [];
  const breaches: BreachHit[] = names.map((n) => ({ name: n }));
  source.ok = true;
  return { sources: [source], breachCount: breaches.length, breaches };
}

export async function hibpLookup(email: string): Promise<Partial<EnrichmentResult>> {
  const paid = await viaHibp(email);
  if (paid && paid.breachCount !== undefined) return paid;
  const free = await viaXposed(email);
  return free;
}
