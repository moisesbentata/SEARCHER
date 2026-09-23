import type { EnrichmentResult } from "./enrich/types";

export type EmailLookupResult = {
  input: string;
  valid: boolean;
  normalized?: string;
  local?: string;
  domain?: string;
  disposable?: boolean;
  free?: boolean;
  role?: boolean;
  provider?: string;
  gravatarUrl?: string;
  breachCount?: number | null;
  enrichment?: EnrichmentResult;
};

const FREE_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "gmx.com",
  "yandex.com",
  "yandex.ru",
  "mail.ru",
  "rocketmail.com",
  "fastmail.com",
]);

const DISPOSABLE_PROVIDERS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "throwaway.email",
  "yopmail.com",
  "sharklasers.com",
  "getnada.com",
  "trashmail.com",
  "dispostable.com",
  "maildrop.cc",
  "mintemail.com",
  "mohmal.com",
  "spambog.com",
  "fakeinbox.com",
]);

const ROLE_LOCALS = new Set([
  "admin",
  "administrator",
  "info",
  "hello",
  "hi",
  "contact",
  "support",
  "help",
  "sales",
  "marketing",
  "press",
  "media",
  "legal",
  "billing",
  "finance",
  "accounts",
  "hr",
  "jobs",
  "careers",
  "team",
  "office",
  "postmaster",
  "webmaster",
  "no-reply",
  "noreply",
  "notifications",
  "notify",
]);

const PROVIDER_LABEL: Record<string, string> = {
  "gmail.com": "Gmail (Google)",
  "googlemail.com": "Gmail (Google)",
  "yahoo.com": "Yahoo Mail",
  "outlook.com": "Outlook (Microsoft)",
  "hotmail.com": "Outlook / Hotmail (Microsoft)",
  "live.com": "Outlook / Live (Microsoft)",
  "msn.com": "MSN (Microsoft)",
  "icloud.com": "iCloud (Apple)",
  "me.com": "iCloud (Apple)",
  "mac.com": "iCloud (Apple)",
  "aol.com": "AOL Mail",
  "protonmail.com": "Proton Mail",
  "proton.me": "Proton Mail",
  "zoho.com": "Zoho Mail",
  "gmx.com": "GMX Mail",
  "yandex.com": "Yandex Mail",
  "yandex.ru": "Yandex Mail",
  "mail.ru": "Mail.ru",
  "fastmail.com": "Fastmail",
};

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

async function md5Hex(input: string): Promise<string> {
  // MD5 is only used to derive the public Gravatar image URL (the Gravatar
  // API is MD5-based). This is not a security use.
  // Node's crypto is available in Next.js API routes.
  const { createHash } = await import("node:crypto");
  return createHash("md5").update(input).digest("hex");
}

export async function lookupEmail(input: string): Promise<EmailLookupResult> {
  const trimmed = (input || "").trim();
  const normalized = trimmed.toLowerCase();

  if (!EMAIL_RE.test(normalized)) {
    return { input: trimmed, valid: false };
  }

  const [local, domain] = normalized.split("@");
  const gravatarHash = await md5Hex(normalized);

  return {
    input: trimmed,
    valid: true,
    normalized,
    local,
    domain,
    disposable: DISPOSABLE_PROVIDERS.has(domain),
    free: FREE_PROVIDERS.has(domain),
    role: ROLE_LOCALS.has(local),
    provider: PROVIDER_LABEL[domain],
    gravatarUrl: `https://www.gravatar.com/avatar/${gravatarHash}?d=404&s=200`,
    breachCount: null,
  };
}
