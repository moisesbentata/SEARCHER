import type { BreachHit, EnrichmentResult, EnrichmentSource } from "./types";

// LeakCheck v2 Pro API. Returns actual leaked values (passwords, phones,
// names, addresses) matched to a query. Set LEAKCHECK_KEY in env to enable.
// Docs: https://docs.leakcheck.io
//
// LeakCheck fills the "juice" tier of the report: given an email/phone,
// what real breach-leaked values are matched to that account. This is the
// content that turns Stage 6 into an actual paywall-justifying report.

const LC_URL = "https://leakcheck.io/api/v2/query";

type LeakCheckHit = {
  source?: { name?: string; breach_date?: string; unverified?: boolean };
  fields?: string[];
  email?: string;
  password?: string;
  username?: string;
  phone?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  dob?: string;
  ip?: string;
  last_ip?: string;
};

type LeakCheckResponse = {
  success?: boolean;
  found?: number;
  quota?: number;
  result?: LeakCheckHit[];
  error?: string;
};

/**
 * Look up leaked records for an email, phone (E.164, no +), or username.
 * The type is auto-detected server-side but we hint via the type param.
 */
export async function leakcheckLookup(
  value: string,
  type: "email" | "phone" | "username" | "auto" = "auto",
): Promise<Partial<EnrichmentResult>> {
  const key = process.env.LEAKCHECK_KEY;
  const source: EnrichmentSource = { provider: "leakcheck", label: "LeakCheck", ok: false };
  const start = Date.now();
  if (!key) {
    source.latencyMs = Date.now() - start;
    return { sources: [source] };
  }

  // LeakCheck expects phone numbers without the leading "+"
  const value_ = type === "phone" ? value.replace(/^\+/, "") : value;
  const url = `${LC_URL}/${encodeURIComponent(value_)}?type=${type}`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 6000);
  try {
    const r = await fetch(url, {
      headers: {
        "X-API-Key": key,
        "user-agent": "searcher-osint/1.0",
      },
      signal: controller.signal,
    });
    source.latencyMs = Date.now() - start;
    if (!r.ok) return { sources: [source] };
    const j = (await r.json().catch(() => null)) as LeakCheckResponse | null;
    if (!j || j.success === false || !Array.isArray(j.result)) {
      source.ok = j?.success === true;
      return { sources: [source], breachCount: j?.found ?? 0, breaches: [] };
    }
    source.ok = true;

    // Roll LeakCheck hits into the same BreachHit shape used by HIBP, but
    // stash the recovered fields (name/phone/address/etc) on dataClasses
    // for the UI to render.
    const breaches: BreachHit[] = j.result.map((hit) => {
      const dc: string[] = [];
      if (hit.password) dc.push(`Password: ${maskPassword(hit.password)}`);
      if (hit.phone) dc.push(`Phone: ${hit.phone}`);
      if (hit.name || hit.first_name || hit.last_name) {
        const full = hit.name || `${hit.first_name ?? ""} ${hit.last_name ?? ""}`.trim();
        if (full) dc.push(`Name: ${full}`);
      }
      if (hit.address) dc.push(`Address: ${hit.address}`);
      if (hit.dob) dc.push(`DOB: ${hit.dob}`);
      if (hit.username) dc.push(`Username: ${hit.username}`);
      if (hit.ip) dc.push(`IP: ${hit.ip}`);
      if (hit.last_ip && hit.last_ip !== hit.ip) dc.push(`Last IP: ${hit.last_ip}`);
      return {
        name: hit.source?.name ?? "Unknown source",
        date: hit.source?.breach_date,
        dataClasses: dc,
      };
    });

    return { sources: [source], breachCount: j.found ?? breaches.length, breaches };
  } catch {
    source.latencyMs = Date.now() - start;
    return { sources: [source] };
  } finally {
    clearTimeout(t);
  }
}

// Show the first + last character of a leaked password with ● in the middle
// so we don't fully expose the value. The user sees enough to recognize a
// pattern ("sunshine1985" → "s●●●●●●●●●●5") without one-click credential theft.
function maskPassword(pw: string): string {
  if (pw.length <= 2) return "●".repeat(pw.length);
  return pw[0] + "●".repeat(Math.min(10, pw.length - 2)) + pw[pw.length - 1];
}
