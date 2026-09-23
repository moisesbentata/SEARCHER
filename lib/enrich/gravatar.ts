import { createHash } from "node:crypto";
import type { EnrichmentResult, EnrichmentSource } from "./types";

// Gravatar. Free, no key. Hash the email, ping the avatar with d=404 so a
// 200 means "this email has a Gravatar", then optionally fetch the JSON
// profile (some users publish a display name, bio, links).

function md5(s: string) {
  return createHash("md5").update(s.trim().toLowerCase()).digest("hex");
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function gravatarLookup(email: string): Promise<Partial<EnrichmentResult>> {
  const source: EnrichmentSource = { provider: "gravatar", label: "Gravatar", ok: false };
  const start = Date.now();
  const hash = md5(email);
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=256`;

  try {
    const head = await withTimeout(fetch(avatarUrl, { method: "HEAD" }), 3500);
    source.latencyMs = Date.now() - start;
    if (!head || head.status !== 200) {
      return { sources: [source] };
    }
    source.ok = true;

    // Best-effort fetch the public profile JSON
    const profile = await withTimeout(
      fetch(`https://www.gravatar.com/${hash}.json`, { headers: { accept: "application/json" } }),
      3500,
    );
    let displayName: string | undefined;
    let bio: string | undefined;
    let publicLinks: string[] | undefined;
    if (profile && profile.ok) {
      const j = (await profile.json().catch(() => null)) as {
        entry?: Array<{
          displayName?: string;
          preferredUsername?: string;
          aboutMe?: string;
          urls?: Array<{ value?: string }>;
        }>;
      } | null;
      const entry = j?.entry?.[0];
      if (entry) {
        displayName = entry.displayName || entry.preferredUsername;
        bio = entry.aboutMe;
        publicLinks = (entry.urls || []).map((u) => u.value).filter(Boolean) as string[];
      }
    }

    return {
      sources: [source],
      avatarUrl,
      displayName,
      bio,
      publicLinks,
    };
  } catch {
    source.latencyMs = Date.now() - start;
    return { sources: [source] };
  }
}
