"use client";

import type { PhoneLookupResult } from "@/lib/phone";
import type { EmailLookupResult } from "@/lib/email";
import type { BreachHit, EnrichmentResult, UsernameHit } from "@/lib/enrich/types";

type Props =
  | { kind: "phone"; query: string; phone: PhoneLookupResult; email: EmailLookupResult | null }
  | { kind: "email"; query: string; phone: PhoneLookupResult | null; email: EmailLookupResult };

export function Stage6Success(props: Props) {
  const enrichment =
    props.kind === "phone" ? props.phone?.enrichment : props.email?.enrichment;

  return (
    <section className="mx-auto max-w-lg px-5 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        Payment successful · Trial started
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
        Your report for {props.query}
      </h1>
      <p className="mt-2 text-ink-500">
        Real findings we surfaced from public sources. Owner-level identity
        data comes online when a paid people-search provider is wired up
        (see roadmap).
      </p>

      {enrichment ? <IdentityBanner enrichment={enrichment} /> : null}

      {props.kind === "phone" && props.phone ? (
        <PhoneCard result={props.phone} />
      ) : null}
      {props.kind === "email" && props.email ? (
        <EmailCard result={props.email} />
      ) : null}

      {enrichment?.breaches && enrichment.breaches.length > 0 ? (
        <BreachCard breaches={enrichment.breaches} />
      ) : null}
      {enrichment?.usernameHits && enrichment.usernameHits.length > 0 ? (
        <UsernameHitsCard hits={enrichment.usernameHits} />
      ) : null}
      {enrichment?.domain?.mx && enrichment.domain.mx.length > 0 ? (
        <DomainCard domain={enrichment.domain.domain} mx={enrichment.domain.mx} />
      ) : null}
      {enrichment?.sources && enrichment.sources.length > 0 ? (
        <SourcesFooter sources={enrichment.sources} />
      ) : null}

      <div className="mt-8 rounded-2xl border border-ink-900/5 bg-ink-900/[0.03] p-5 text-sm text-ink-700">
        <div className="font-semibold text-ink-900">What comes next</div>
        <p className="mt-2">
          Wire a paid people-search provider (Endato, PeopleDataLabs,
          Enformion) and the owner-level fields — full name, addresses,
          relatives, associated phones — fill in on this same page.
        </p>
      </div>
    </section>
  );
}

function IdentityBanner({ enrichment }: { enrichment: EnrichmentResult }) {
  const { avatarUrl, displayName, bio, publicLinks } = enrichment;
  if (!avatarUrl && !displayName && !bio) return null;
  return (
    <div className="mt-6 flex items-start gap-4 rounded-2xl border border-brand-500/20 bg-brand-50 p-5">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-ink-900/10"
        />
      ) : (
        <div className="h-16 w-16 shrink-0 rounded-xl bg-brand-200" />
      )}
      <div className="min-w-0 flex-1">
        {displayName ? (
          <div className="text-lg font-bold text-ink-900">{displayName}</div>
        ) : null}
        {bio ? <div className="mt-1 text-sm text-ink-700">{bio}</div> : null}
        {publicLinks && publicLinks.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {publicLinks.slice(0, 4).map((u) => (
              <a
                key={u}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-ink-900/5 hover:underline"
              >
                {new URL(u).host.replace(/^www\./, "")}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-ink-900/5 py-3 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-ink-900">{value}</div>
    </div>
  );
}

function PhoneCard({ result }: { result: PhoneLookupResult }) {
  return (
    <div className="mt-6 rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-ink-400">Phone number</div>
      <div className="mt-1 text-xl font-semibold">{result.international}</div>
      <div className="mt-4">
        <Field label="Country" value={`${result.country ?? "—"} (${result.countryCode ?? "—"})`} />
        <Field label="Region" value={result.region ?? "Not identified"} />
        <Field
          label="City"
          value={result.citiesHint?.length ? result.citiesHint.join(", ") : "Not identified"}
        />
        <Field label="Line type" value={result.carrierHint ?? "Unknown"} />
        <Field label="Carrier" value={result.carrier ?? "Not identified"} />
        <Field label="National format" value={result.national ?? "—"} />
        <Field label="E.164" value={<code className="text-xs">{result.e164}</code>} />
      </div>
    </div>
  );
}

function EmailCard({ result }: { result: EmailLookupResult }) {
  return (
    <div className="mt-6 rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-ink-400">Email</div>
      <div className="mt-1 break-all text-xl font-semibold">{result.normalized}</div>
      <div className="mt-4">
        <Field label="Provider" value={result.provider ?? "Custom / self-hosted"} />
        <Field label="Free provider" value={result.free ? "Yes" : "No"} />
        <Field label="Disposable / burner" value={result.disposable ? "Yes" : "No"} />
        <Field label="Role account" value={result.role ? "Yes" : "No"} />
        <Field
          label="Known data breaches"
          value={
            result.breachCount === null || result.breachCount === undefined
              ? "Enable breach lookup"
              : result.breachCount === 0
                ? "None found"
                : `${result.breachCount} data breaches`
          }
        />
      </div>
    </div>
  );
}

function BreachCard({ breaches }: { breaches: BreachHit[] }) {
  return (
    <div className="mt-6 rounded-2xl border border-rose-500/25 bg-rose-50 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-rose-900">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        Found in {breaches.length} data breach{breaches.length === 1 ? "" : "es"}
      </div>
      <ul className="mt-3 space-y-2">
        {breaches.slice(0, 8).map((b) => (
          <li key={b.name} className="rounded-lg bg-white p-3 text-sm shadow-sm">
            <div className="font-semibold text-ink-900">{b.name}</div>
            {b.date ? <div className="text-xs text-ink-500">Breached {b.date}</div> : null}
            {b.dataClasses && b.dataClasses.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {b.dataClasses.slice(0, 5).map((dc) => (
                  <span key={dc} className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                    {dc}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {breaches.length > 8 ? (
        <div className="mt-2 text-xs text-rose-800">…and {breaches.length - 8} more</div>
      ) : null}
    </div>
  );
}

function UsernameHitsCard({ hits }: { hits: UsernameHit[] }) {
  return (
    <div className="mt-6 rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-ink-900">
        Found on {hits.length} public site{hits.length === 1 ? "" : "s"}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {hits.map((h) => (
          <a
            key={h.site}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-ink-900/[0.04] px-3 py-2 text-xs font-semibold text-ink-800 hover:bg-brand-100"
          >
            <span className="truncate">{h.site}</span>
            <svg viewBox="0 0 24 24" className="ml-1 h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 17 10-10M17 7H8M17 7v9" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}

function DomainCard({ domain, mx }: { domain: string; mx: string[] }) {
  return (
    <div className="mt-6 rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-ink-900">Domain intel · {domain}</div>
      <div className="mt-2 text-xs text-ink-500">Mail servers (in priority order)</div>
      <ul className="mt-1 space-y-1 text-sm">
        {mx.map((m) => (
          <li key={m} className="rounded bg-ink-900/[0.04] px-2 py-1 font-mono text-xs">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourcesFooter({ sources }: { sources: EnrichmentResult["sources"] }) {
  return (
    <div className="mt-6 text-xs text-ink-400">
      <div className="font-semibold text-ink-500">Sources checked</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {sources.map((s, i) => (
          <span
            key={`${s.provider}-${i}`}
            className={`rounded-full px-2 py-0.5 ${s.ok ? "bg-emerald-100 text-emerald-800" : "bg-ink-900/[0.05] text-ink-500"}`}
          >
            {s.label}
            {s.ok ? " ✓" : " —"}
          </span>
        ))}
      </div>
    </div>
  );
}
