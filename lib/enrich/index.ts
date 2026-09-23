import type { EnrichmentResult } from "./types";
import { gravatarLookup } from "./gravatar";
import { hibpLookup } from "./hibp";
import { domainLookup } from "./domain";
import { sherlockLookup, usernameFromEmail } from "./sherlock";

// Merge multiple partial results into one, concatenating array fields and
// preferring the first-set value on scalar fields.
function merge(parts: Partial<EnrichmentResult>[]): EnrichmentResult {
  const out: EnrichmentResult = { sources: [] };
  for (const p of parts) {
    if (p.sources) out.sources.push(...p.sources);
    if (p.avatarUrl && !out.avatarUrl) out.avatarUrl = p.avatarUrl;
    if (p.displayName && !out.displayName) out.displayName = p.displayName;
    if (p.bio && !out.bio) out.bio = p.bio;
    if (p.publicLinks) out.publicLinks = [...(out.publicLinks ?? []), ...p.publicLinks];
    if (typeof p.breachCount === "number" && out.breachCount === undefined) out.breachCount = p.breachCount;
    if (p.breaches) out.breaches = [...(out.breaches ?? []), ...p.breaches];
    if (p.usernameHits) out.usernameHits = [...(out.usernameHits ?? []), ...p.usernameHits];
    if (p.domain && !out.domain) out.domain = p.domain;
  }
  return out;
}

// Run every provider that applies to an email, in parallel, and merge.
export async function enrichEmail(email: string): Promise<EnrichmentResult> {
  const username = usernameFromEmail(email);
  const settled = await Promise.allSettled([
    gravatarLookup(email),
    hibpLookup(email),
    domainLookup(email),
    sherlockLookup(username),
  ]);
  const parts = settled
    .filter((r): r is PromiseFulfilledResult<Partial<EnrichmentResult>> => r.status === "fulfilled")
    .map((r) => r.value);
  return merge(parts);
}

// Phone enrichment is much thinner without a paid people-search provider.
// For now: HIBP paid endpoint accepts E.164 phone numbers, so we ping it if
// a key is set. Everything else waits for Phase 2/3.
export async function enrichPhone(e164: string): Promise<EnrichmentResult> {
  const settled = await Promise.allSettled([hibpLookup(e164)]);
  const parts = settled
    .filter((r): r is PromiseFulfilledResult<Partial<EnrichmentResult>> => r.status === "fulfilled")
    .map((r) => r.value);
  return merge(parts);
}

export type { EnrichmentResult } from "./types";
