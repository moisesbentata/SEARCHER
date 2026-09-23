import type { EnrichmentResult } from "./types";
import { gravatarLookup } from "./gravatar";
import { hibpLookup } from "./hibp";
import { domainLookup } from "./domain";
import { sherlockLookup, usernameFromEmail } from "./sherlock";
import { githubSearch } from "./github-search";
import { waybackLookup } from "./wayback";
import { rdapLookup } from "./rdap";

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
    if (p.githubMentions) out.githubMentions = [...(out.githubMentions ?? []), ...p.githubMentions];
    if (p.webMentions) out.webMentions = [...(out.webMentions ?? []), ...p.webMentions];
    if (p.domain) {
      out.domain = { ...(out.domain ?? { domain: p.domain.domain }), ...p.domain };
    }
  }
  return out;
}

// Run every provider that applies to an email, in parallel, and merge.
export async function enrichEmail(email: string): Promise<EnrichmentResult> {
  const username = usernameFromEmail(email);
  const domain = email.split("@")[1] ?? "";
  const settled = await Promise.allSettled([
    gravatarLookup(email),
    hibpLookup(email),
    domainLookup(email),
    sherlockLookup(username),
    githubSearch(email),
    waybackLookup(email),
    domain ? rdapLookup(domain) : Promise.resolve<Partial<EnrichmentResult>>({ sources: [] }),
  ]);
  const parts = settled
    .filter((r): r is PromiseFulfilledResult<Partial<EnrichmentResult>> => r.status === "fulfilled")
    .map((r) => r.value);
  return merge(parts);
}

// Phone enrichment: HIBP for breach appearance, GitHub / Wayback for public
// mentions of the number. Everything else waits for paid data.
export async function enrichPhone(e164: string): Promise<EnrichmentResult> {
  const settled = await Promise.allSettled([
    hibpLookup(e164),
    githubSearch(e164),
    waybackLookup(e164),
  ]);
  const parts = settled
    .filter((r): r is PromiseFulfilledResult<Partial<EnrichmentResult>> => r.status === "fulfilled")
    .map((r) => r.value);
  return merge(parts);
}

export type { EnrichmentResult } from "./types";
