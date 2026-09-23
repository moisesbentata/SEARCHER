// Shared types for the enrichment layer. Every provider returns a partial
// EnrichmentResult and an EnrichmentSource so we can show the user which
// sources contributed to each finding (transparency + legal shield).

export type EnrichmentSource = {
  provider: string; // internal id, e.g. "gravatar"
  label: string; // human label, e.g. "Gravatar"
  ok: boolean; // did we get any data
  latencyMs?: number;
};

export type BreachHit = {
  name: string;
  domain?: string;
  date?: string;
  dataClasses?: string[]; // e.g. ["Email", "Password", "IP"]
  logoUrl?: string;
};

export type UsernameHit = {
  site: string;
  url: string;
  icon?: string; // svg name or emoji
};

export type DomainInfo = {
  domain: string;
  mx?: string[];
  disposable?: boolean;
  role?: boolean;
  registrar?: string;
  createdOn?: string;
  expiresOn?: string;
  lastChangedOn?: string;
  ageYears?: number;
  nameservers?: string[];
};

export type WebMention = {
  url: string;
  captured?: string;
  archiveUrl?: string;
};

export type EnrichmentResult = {
  sources: EnrichmentSource[];

  // Identity signals
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  publicLinks?: string[];

  // Breach exposure
  breachCount?: number;
  breaches?: BreachHit[];

  // Presence checks
  usernameHits?: UsernameHit[];
  githubMentions?: UsernameHit[];
  webMentions?: WebMention[];

  // Domain info (for email)
  domain?: DomainInfo;
};
