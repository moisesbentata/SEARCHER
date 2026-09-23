import type { EnrichmentResult, EnrichmentSource, UsernameHit } from "./types";

// Curated username-presence check across public sites. Each site has:
//   url: the profile URL where {u} is replaced with the username
//   detect: how we tell "profile exists"
//     - "status": 200 = exists, 404 = missing (fastest, HEAD-friendly)
//     - "body-not-missing": 200 but with a "not found" marker in the body
//
// This is a Sherlock-style approach (github.com/sherlock-project/sherlock)
// trimmed to sites that reliably respond to unauthenticated requests. No key
// needed. Rate-limited per host — we fire everything in parallel with a
// 4s per-host timeout.

type Site = {
  name: string;
  url: string; // {u} is replaced
  detect: "status" | "body-not-missing";
  missingMarker?: string;
};

const SITES: Site[] = [
  { name: "GitHub", url: "https://github.com/{u}", detect: "status" },
  { name: "Reddit", url: "https://www.reddit.com/user/{u}/about.json", detect: "status" },
  { name: "Twitter / X", url: "https://twitter.com/{u}", detect: "status" },
  { name: "Instagram", url: "https://www.instagram.com/{u}/", detect: "status" },
  { name: "TikTok", url: "https://www.tiktok.com/@{u}", detect: "status" },
  { name: "YouTube", url: "https://www.youtube.com/@{u}", detect: "status" },
  { name: "Twitch", url: "https://www.twitch.tv/{u}", detect: "status" },
  { name: "Pinterest", url: "https://www.pinterest.com/{u}/", detect: "status" },
  { name: "Medium", url: "https://medium.com/@{u}", detect: "status" },
  { name: "DEV.to", url: "https://dev.to/{u}", detect: "status" },
  { name: "Stack Overflow", url: "https://stackoverflow.com/users/{u}", detect: "status" },
  { name: "GitLab", url: "https://gitlab.com/{u}", detect: "status" },
  { name: "Vimeo", url: "https://vimeo.com/{u}", detect: "status" },
  { name: "SoundCloud", url: "https://soundcloud.com/{u}", detect: "status" },
  { name: "Steam", url: "https://steamcommunity.com/id/{u}", detect: "body-not-missing", missingMarker: "The specified profile could not be found" },
  { name: "Spotify", url: "https://open.spotify.com/user/{u}", detect: "status" },
  { name: "Behance", url: "https://www.behance.net/{u}", detect: "status" },
  { name: "Dribbble", url: "https://dribbble.com/{u}", detect: "status" },
  { name: "Flickr", url: "https://www.flickr.com/people/{u}", detect: "status" },
  { name: "Etsy", url: "https://www.etsy.com/shop/{u}", detect: "status" },
  { name: "Venmo", url: "https://venmo.com/u/{u}", detect: "status" },
  { name: "Cash App", url: "https://cash.app/${u}", detect: "status" },
  { name: "Keybase", url: "https://keybase.io/{u}", detect: "status" },
  { name: "Patreon", url: "https://www.patreon.com/{u}", detect: "status" },
  { name: "Product Hunt", url: "https://www.producthunt.com/@{u}", detect: "status" },
  { name: "Fiverr", url: "https://www.fiverr.com/{u}", detect: "status" },
  { name: "Kick", url: "https://kick.com/{u}", detect: "status" },
];

async function checkSite(site: Site, username: string): Promise<UsernameHit | null> {
  const url = site.url.replaceAll("{u}", encodeURIComponent(username));
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    if (site.detect === "status") {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; searcher-osint/1.0)",
        },
        signal: ctrl.signal,
      });
      if (res.status === 200) return { site: site.name, url };
      return null;
    }
    // body-not-missing: fetch the page, look for the missing marker
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; searcher-osint/1.0)",
      },
      signal: ctrl.signal,
    });
    if (res.status !== 200) return null;
    const text = await res.text();
    if (site.missingMarker && text.includes(site.missingMarker)) return null;
    return { site: site.name, url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Given an email or phone, derive a plausible username to check.
export function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local.replace(/[+.].*$/, "").toLowerCase();
}

export async function sherlockLookup(username: string): Promise<Partial<EnrichmentResult>> {
  const source: EnrichmentSource = {
    provider: "sherlock",
    label: `Username presence (${SITES.length} sites)`,
    ok: false,
  };
  const start = Date.now();
  if (!username || username.length < 3) {
    source.latencyMs = Date.now() - start;
    return { sources: [source] };
  }
  const results = await Promise.all(SITES.map((s) => checkSite(s, username)));
  const hits = results.filter((r): r is UsernameHit => r !== null);
  source.ok = true;
  source.latencyMs = Date.now() - start;
  return { sources: [source], usernameHits: hits };
}
