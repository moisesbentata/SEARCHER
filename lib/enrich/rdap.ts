import type { EnrichmentResult, EnrichmentSource } from "./types";

// RDAP (Registration Data Access Protocol) — the modern free replacement for
// WHOIS. Every gTLD registry serves it. Returns domain registration date,
// registrar, expiration, name servers. Public, no auth.

const RDAP_BOOTSTRAP = "https://rdap.org/domain";

export async function rdapLookup(domain: string): Promise<Partial<EnrichmentResult>> {
  const source: EnrichmentSource = { provider: "rdap", label: "Domain RDAP", ok: false };
  const start = Date.now();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const r = await fetch(`${RDAP_BOOTSTRAP}/${encodeURIComponent(domain)}`, {
      headers: {
        accept: "application/rdap+json",
        "user-agent": "searcher-osint/1.0",
      },
      signal: controller.signal,
    });
    source.latencyMs = Date.now() - start;
    if (!r.ok) return { sources: [source] };
    const j = (await r.json().catch(() => null)) as
      | {
          ldhName?: string;
          events?: Array<{ eventAction?: string; eventDate?: string }>;
          entities?: Array<{ roles?: string[]; vcardArray?: unknown[]; publicIds?: unknown[] }>;
          nameservers?: Array<{ ldhName?: string }>;
        }
      | null;
    if (!j) return { sources: [source] };

    const findEvent = (action: string) =>
      j.events?.find((e) => e.eventAction === action)?.eventDate;
    const registration = findEvent("registration");
    const expiration = findEvent("expiration");
    const lastChanged = findEvent("last changed");

    // Registrar entity's vCard (roughly [ "vcard", [ [name, ..., value], ... ] ])
    let registrar: string | undefined;
    const registrarEntity = j.entities?.find((e) => e.roles?.includes("registrar"));
    if (registrarEntity && Array.isArray(registrarEntity.vcardArray)) {
      const vcard = registrarEntity.vcardArray[1];
      if (Array.isArray(vcard)) {
        const fn = (vcard as unknown[][]).find((row) => Array.isArray(row) && row[0] === "fn");
        if (fn && typeof fn[3] === "string") registrar = fn[3];
      }
    }

    source.ok = true;
    const yearsSince = registration
      ? Math.round(
          (Date.now() - new Date(registration).getTime()) / (365.25 * 24 * 3600 * 1000),
        )
      : undefined;
    return {
      sources: [source],
      domain: {
        domain,
        registrar,
        createdOn: registration,
        expiresOn: expiration,
        lastChangedOn: lastChanged,
        ageYears: yearsSince,
        nameservers: j.nameservers?.map((n) => n.ldhName ?? "").filter(Boolean),
      },
    };
  } catch {
    source.latencyMs = Date.now() - start;
    return { sources: [source] };
  } finally {
    clearTimeout(t);
  }
}
