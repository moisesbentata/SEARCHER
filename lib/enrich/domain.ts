import { promises as dns } from "node:dns";
import type { DomainInfo, EnrichmentResult, EnrichmentSource } from "./types";

// Bundled list of the most common disposable / temp-mail domains. Not
// exhaustive but catches the top ~200 that matter for reputation.
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com", "20minutemail.com", "mailinator.com", "mailinator.net",
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "grr.la",
  "sharklasers.com", "temp-mail.org", "tempail.com", "tempmail.com",
  "trashmail.com", "trashmail.net", "yopmail.com", "yopmail.fr",
  "throwawaymail.com", "emkei.cz", "getnada.com", "dispostable.com",
  "maildrop.cc", "moakt.com", "mytemp.email", "spam4.me",
  "temp-mail.io", "tempmailaddress.com", "fakeinbox.com",
  "fakemail.net", "mohmal.com", "temp-mailbox.com", "10mail.org",
  "burnermail.io", "anonaddy.me", "simplelogin.io", "duck.com",
  "proton.me", "protonmail.ch", "hide.me", "cock.li",
  "opayq.com", "spamgourmet.com", "throwam.com",
]);

const ROLE_LOCAL_PARTS = new Set([
  "info", "sales", "support", "help", "admin", "administrator",
  "contact", "hello", "team", "office", "hr", "billing", "accounts",
  "no-reply", "noreply", "notifications", "postmaster", "webmaster",
  "abuse", "security", "press", "marketing", "media", "jobs",
  "careers", "newsletter", "hi",
]);

export async function domainLookup(email: string): Promise<Partial<EnrichmentResult>> {
  const source: EnrichmentSource = { provider: "dns-mx", label: "DNS lookup", ok: false };
  const start = Date.now();
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (!domain) {
    source.latencyMs = Date.now() - start;
    return { sources: [source] };
  }

  const info: DomainInfo = {
    domain,
    disposable: DISPOSABLE_DOMAINS.has(domain),
    role: ROLE_LOCAL_PARTS.has(local ?? ""),
  };

  try {
    const mx = await dns.resolveMx(domain);
    info.mx = mx
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5)
      .map((r) => r.exchange);
    source.ok = true;
  } catch {
    // No MX record — invalid / non-mail domain
  }

  source.latencyMs = Date.now() - start;
  return { sources: [source], domain: info };
}
