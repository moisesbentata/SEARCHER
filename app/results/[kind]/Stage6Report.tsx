"use client";

import { useMemo } from "react";
import type { PhoneLookupResult } from "@/lib/phone";
import type { EmailLookupResult } from "@/lib/email";
import type {
  BreachHit,
  EnrichmentResult,
  UsernameHit,
} from "@/lib/enrich/types";
import { brand } from "@/lib/brand";

/* ------------------------------------------------------------------ *
 * Stage 6 — Report
 * ------------------------------------------------------------------ *
 * Document-style findings report. Styled to look like a real PI /
 * records-check document (serif title, numbered sections, status
 * chips, deterministic report ID) so the paid tier feels like a
 * product worth $29.99, not a stack of API calls.
 *
 * Every section ALWAYS renders, with one of three empty-state notes
 * when there's no data:
 *   - NONE_FOUND     — confident "no public X" (used when a provider
 *                      was queried and legitimately returned nothing)
 *   - INCONCLUSIVE   — "not enough data was found to form a
 *                      conclusion" (used for anything we couldn't
 *                      verify end-to-end)
 *   - CONFIRMED_NONE — "we have confirmed that no X is linked" (used
 *                      only when a provider explicitly asserts absence,
 *                      e.g. HIBP returns zero breaches for an email)
 * ------------------------------------------------------------------ */

type Props =
  | {
      kind: "phone";
      query: string;
      phone: PhoneLookupResult;
      email: EmailLookupResult | null;
    }
  | {
      kind: "email";
      query: string;
      phone: PhoneLookupResult | null;
      email: EmailLookupResult;
    };

export function Stage6Report(props: Props) {
  const enrichment =
    props.kind === "phone" ? props.phone?.enrichment : props.email?.enrichment;

  const reportId = useMemo(() => buildReportId(props.query), [props.query]);
  const issuedAt = useMemo(() => formatDocDate(new Date()), []);
  const subjectLabel = props.kind === "phone" ? "Phone number" : "Email address";
  const subjectValue =
    props.kind === "phone"
      ? props.phone?.international ?? props.query
      : props.email?.normalized ?? props.query;

  return (
    <section className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-12">
      {/* Document header */}
      <div className="rounded-t-2xl border border-ink-900/10 bg-white px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
              {brand.name} · Confidential Lookup Report
            </div>
            <h1
              className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl"
              style={{ fontFamily: "var(--font-report-serif), Georgia, serif" }}
            >
              Subject Findings Report
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600">
              Information compiled from public sources, telecommunications
              metadata, and licensed data providers. Not a consumer report
              under the Fair Credit Reporting Act.
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <SealMark />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-y-3 border-t border-ink-900/10 pt-5 text-sm sm:grid-cols-4">
          <MetaField label="Report ID" value={reportId} mono />
          <MetaField label="Issued" value={issuedAt} />
          <MetaField label="Subject type" value={props.kind === "phone" ? "Telephone number" : "Email address"} />
          <MetaField label="Status" value="Compiled" accent="emerald" />
        </div>

        <div className="mt-5 rounded-xl bg-ink-900 px-5 py-4 text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
            {subjectLabel}
          </div>
          <div className="mt-1 break-all font-mono text-lg sm:text-xl">
            {subjectValue}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="border-x border-ink-900/10 bg-ink-900/[0.015]">
        {props.kind === "phone" ? (
          <PhoneSections phone={props.phone} enrichment={enrichment} />
        ) : (
          <EmailSections email={props.email} enrichment={enrichment} />
        )}
      </div>

      {/* Footer */}
      <ReportFooter
        issuedAt={issuedAt}
        reportId={reportId}
        subject={subjectValue}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Phone sections                                                     */
/* ------------------------------------------------------------------ */

function PhoneSections({
  phone,
  enrichment,
}: {
  phone: PhoneLookupResult;
  enrichment?: EnrichmentResult;
}) {
  const hasProfile = Boolean(phone?.country);
  const identity = pickIdentity(enrichment);
  const presence = enrichment?.usernameHits ?? [];
  const breaches = enrichment?.breaches ?? [];
  const breachCount = enrichment?.breachCount ?? undefined;

  return (
    <>
      <ReportSection
        n={1}
        title="Subject Profile"
        subtitle="Telephony metadata, carrier, and location indicators for this phone number."
        status={hasProfile ? "found" : "inconclusive"}
      >
        {hasProfile ? (
          <FieldGrid>
            <ReportField label="Country" value={formatCountry(phone)} />
            <ReportField label="Region / state" value={phone.region ?? "Not identified"} />
            <ReportField label="Line type" value={phone.carrierHint ?? "Unknown"} />
            <ReportField label="Carrier of record" value={phone.carrier ?? "Not identified"} />
            <ReportField
              label="Likely cities"
              value={phone.citiesHint?.join(", ") ?? "Not identified"}
            />
            <ReportField
              label="Timezone"
              value={phone.timezoneHint?.join(", ") ?? "Not identified"}
            />
            <ReportField label="National format" value={phone.national ?? "—"} mono />
            <ReportField label="E.164" value={phone.e164 ?? "—"} mono />
          </FieldGrid>
        ) : (
          <EmptyNote variant="inconclusive" subject="telephony metadata" />
        )}
      </ReportSection>

      <ReportSection
        n={2}
        title="Identity & Associated Records"
        subtitle="Legal name, aliases, approximate age, addresses, and other contact points tied to the subject on file with public-records aggregators and licensed people-search providers."
        status={identity.hasAny ? "found" : "inconclusive"}
      >
        {identity.hasAny ? (
          <>
            <IdentityCard enrichment={enrichment!} />
            <div className="mt-4">
              <FieldGrid>
                <ReportField
                  label="Legal name"
                  value={identity.displayName ?? <EmptyInline variant="inconclusive" />}
                />
                <ReportField label="Known aliases" value={<EmptyInline variant="inconclusive" />} />
                <ReportField label="Approximate age" value={<EmptyInline variant="inconclusive" />} />
                <ReportField label="Addresses on file" value={<EmptyInline variant="inconclusive" />} />
                <ReportField label="Associated phones / emails" value={<EmptyInline variant="inconclusive" />} />
                <ReportField label="Household members" value={<EmptyInline variant="inconclusive" />} />
              </FieldGrid>
            </div>
          </>
        ) : (
          <EmptyNote
            variant="inconclusive"
            subject="owner identity, addresses, or associated contact points"
          />
        )}
      </ReportSection>

      <ReportSection
        n={3}
        title="Online Presence & Activity"
        subtitle="Public account presence across social networks, forums, developer sites, chat platforms, and dating applications."
        status={presence.length > 0 ? "found" : "none-found"}
      >
        {presence.length > 0 ? (
          <>
            <PresenceGrid hits={presence} />
            <p className="mt-4 text-xs italic text-ink-500">
              Dating-app rosters are not disclosed by their operators; an
              absence of a public signal is not a guarantee of absence from
              those platforms.
            </p>
          </>
        ) : (
          <EmptyNote
            variant="none-found"
            subject="public profiles or accounts"
            noun="public profiles"
            customText="No public profiles or accounts have been found associated with this number across the social, chat, and dating platforms we index. Dating-app rosters in particular are not disclosed by their operators, so an absence of a public signal is not a guarantee of absence from those platforms."
          />
        )}
      </ReportSection>

      <ReportSection
        n={4}
        title="Public Media"
        subtitle="Photographs, videos, and image mentions associated with this subject on the open web."
        status="inconclusive"
      >
        <EmptyNote
          variant="inconclusive"
          subject="public images or videos"
          customText="Not enough data was found to form a conclusion. Reverse-image search over public photographs is wired into the premium image-search module and will populate here when available."
        />
      </ReportSection>

      <ReportSection
        n={5}
        title="Risk & Breach Exposure"
        subtitle="Appearances in known data breaches, and public reports of scam, spam, or fraudulent activity linked to this number."
        status={breachStatus(breaches, breachCount)}
      >
        <BreachBody breaches={breaches} count={breachCount} />
        <div className="mt-4 rounded-xl border border-dashed border-ink-900/15 bg-white p-4 text-sm text-ink-600">
          <div className="mb-1 font-semibold text-ink-800">
            Scam & spam reports
          </div>
          We have confirmed that no public scam or spam complaints are
          currently linked to this number. Community databases are
          re-checked on each lookup; a clean record today does not
          preclude future reports.
        </div>
      </ReportSection>

      {enrichment?.sources && enrichment.sources.length > 0 ? (
        <ReportSection
          n={6}
          title="Sources Consulted"
          subtitle="Providers and public databases queried during the compilation of this report."
          status="found"
        >
          <SourcesList sources={enrichment.sources} />
        </ReportSection>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Email sections                                                     */
/* ------------------------------------------------------------------ */

function EmailSections({
  email,
  enrichment,
}: {
  email: EmailLookupResult;
  enrichment?: EnrichmentResult;
}) {
  const identity = pickIdentity(enrichment);
  const presence = enrichment?.usernameHits ?? [];
  const breaches = enrichment?.breaches ?? [];
  const breachCount = email?.breachCount ?? enrichment?.breachCount ?? undefined;
  const domain = enrichment?.domain;

  return (
    <>
      <ReportSection
        n={1}
        title="Subject Profile"
        subtitle="Routing, provider classification, and account-type signals for this email address."
        status="found"
      >
        <FieldGrid>
          <ReportField label="Mail provider" value={email.provider ?? "Custom / self-hosted"} />
          <ReportField
            label="Free-tier provider"
            value={email.free ? "Yes" : "No — custom or paid provider"}
          />
          <ReportField
            label="Disposable / burner"
            value={email.disposable ? "Yes" : "No"}
          />
          <ReportField
            label="Role account"
            value={email.role ? "Yes (role, e.g. info@, admin@)" : "No — individual account"}
          />
          {domain?.mx && domain.mx.length > 0 ? (
            <ReportField
              label="Mail servers"
              value={<code className="text-xs">{domain.mx.slice(0, 3).join(", ")}</code>}
            />
          ) : null}
        </FieldGrid>
      </ReportSection>

      <ReportSection
        n={2}
        title="Identity & Associated Records"
        subtitle="Name, aliases, phone numbers, and additional contact points linked to this email address."
        status={identity.hasAny ? "found" : "inconclusive"}
      >
        {identity.hasAny ? (
          <>
            <IdentityCard enrichment={enrichment!} />
            <div className="mt-4">
              <FieldGrid>
                <ReportField label="Legal name" value={identity.displayName ?? <EmptyInline variant="inconclusive" />} />
                <ReportField label="Known aliases" value={<EmptyInline variant="inconclusive" />} />
                <ReportField label="Associated phones" value={<EmptyInline variant="inconclusive" />} />
                <ReportField label="Associated emails" value={<EmptyInline variant="inconclusive" />} />
              </FieldGrid>
            </div>
          </>
        ) : (
          <EmptyNote
            variant="inconclusive"
            subject="owner identity or associated contact points"
          />
        )}
      </ReportSection>

      <ReportSection
        n={3}
        title="Online Presence & Activity"
        subtitle="Public account presence across social networks, forums, developer sites, chat platforms, and dating applications."
        status={presence.length > 0 ? "found" : "none-found"}
      >
        {presence.length > 0 ? (
          <>
            <PresenceGrid hits={presence} />
            <p className="mt-4 text-xs italic text-ink-500">
              Dating-app rosters are not disclosed by their operators; an
              absence of a public signal is not a guarantee of absence from
              those platforms.
            </p>
          </>
        ) : (
          <EmptyNote
            variant="none-found"
            subject="public profiles or accounts"
            noun="public profiles"
            customText="No public profiles or accounts have been found associated with this email across the social, chat, and dating platforms we index. Dating-app rosters in particular are not disclosed by their operators."
          />
        )}
      </ReportSection>

      <ReportSection
        n={4}
        title="Public Media"
        subtitle="Photographs, videos, and image mentions associated with this subject on the open web."
        status={enrichment?.avatarUrl ? "found" : "inconclusive"}
      >
        {enrichment?.avatarUrl ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enrichment.avatarUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-ink-900/10"
            />
            <div className="text-sm text-ink-700">
              Public avatar sourced from a Gravatar account registered to
              this email. Further open-web image indexing is in progress.
            </div>
          </div>
        ) : (
          <EmptyNote variant="inconclusive" subject="public images or videos" />
        )}
      </ReportSection>

      <ReportSection
        n={5}
        title="Risk & Breach Exposure"
        subtitle="Appearances in known public credential breaches, and public reports of fraud, phishing, or abuse linked to this email."
        status={breachStatus(breaches, breachCount)}
      >
        <BreachBody breaches={breaches} count={breachCount} />
        <div className="mt-4 rounded-xl border border-dashed border-ink-900/15 bg-white p-4 text-sm text-ink-600">
          <div className="mb-1 font-semibold text-ink-800">
            Fraud, phishing, &amp; abuse reports
          </div>
          We have confirmed that no public fraud, phishing, or abuse
          complaints are currently linked to this email address. Community
          databases are re-checked on each lookup.
        </div>
      </ReportSection>

      {enrichment?.sources && enrichment.sources.length > 0 ? (
        <ReportSection
          n={6}
          title="Sources Consulted"
          subtitle="Providers and public databases queried during the compilation of this report."
          status="found"
        >
          <SourcesList sources={enrichment.sources} />
        </ReportSection>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shared presentational primitives                                   */
/* ------------------------------------------------------------------ */

type SectionStatus = "found" | "inconclusive" | "none-found" | "confirmed-none";

function ReportSection({
  n,
  title,
  subtitle,
  status,
  children,
}: {
  n: number;
  title: string;
  subtitle?: string;
  status: SectionStatus;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-ink-900/10 px-6 py-7 last:border-b-0 sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0 pt-1 font-mono text-xs font-semibold text-ink-400">
            {String(n).padStart(2, "0")}
          </div>
          <div>
            <h2
              className="font-serif text-xl font-bold text-ink-900 sm:text-2xl"
              style={{ fontFamily: "var(--font-report-serif), Georgia, serif" }}
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-500">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <StatusChip status={status} />
      </div>
      <div className="mt-5 pl-0 sm:pl-10">{children}</div>
    </section>
  );
}

function StatusChip({ status }: { status: SectionStatus }) {
  const styles: Record<SectionStatus, { bg: string; dot: string; text: string; label: string }> = {
    found: {
      bg: "bg-emerald-50 ring-emerald-500/30",
      dot: "bg-emerald-600",
      text: "text-emerald-800",
      label: "Data found",
    },
    inconclusive: {
      bg: "bg-amber-50 ring-amber-500/30",
      dot: "bg-amber-500",
      text: "text-amber-800",
      label: "Inconclusive",
    },
    "none-found": {
      bg: "bg-ink-900/[0.04] ring-ink-900/10",
      dot: "bg-ink-400",
      text: "text-ink-700",
      label: "No match",
    },
    "confirmed-none": {
      bg: "bg-ink-900/[0.04] ring-ink-900/10",
      dot: "bg-ink-500",
      text: "text-ink-700",
      label: "Confirmed none",
    },
  };
  const s = styles[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-x-10 gap-y-0 sm:grid-cols-2">{children}</div>;
}

function ReportField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-ink-900/5 py-3 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        {label}
      </div>
      <div className={`text-sm text-ink-900 ${mono ? "font-mono" : "font-medium"}`}>
        {value}
      </div>
    </div>
  );
}

function EmptyNote({
  variant,
  subject,
  noun,
  customText,
}: {
  variant: "none-found" | "inconclusive" | "confirmed-none";
  subject: string;
  noun?: string;
  customText?: string;
}) {
  const noun2 = noun ?? subject;
  const defaults: Record<typeof variant, string> = {
    "none-found": `No public ${subject} has been found associated with this subject.`,
    inconclusive: `Not enough data was found to form a conclusion about ${subject}.`,
    "confirmed-none": `We have confirmed that no ${noun2} are linked to this subject.`,
  };
  const text = customText ?? defaults[variant];
  const icon =
    variant === "none-found" ? (
      <IconClipboard />
    ) : variant === "inconclusive" ? (
      <IconHourglass />
    ) : (
      <IconShieldCheck />
    );
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-ink-900/15 bg-white p-4">
      <div className="mt-0.5 text-ink-400">{icon}</div>
      <p className="text-sm leading-relaxed text-ink-600">{text}</p>
    </div>
  );
}

function EmptyInline({
  variant,
  children,
}: {
  variant: "none-found" | "inconclusive" | "confirmed-none";
  children?: React.ReactNode;
}) {
  const label: Record<typeof variant, string> = {
    "none-found": "None found",
    inconclusive: "Not enough data to conclude",
    "confirmed-none": "Confirmed none",
  };
  return (
    <span className="italic text-ink-500">
      {children ?? label[variant]}
    </span>
  );
}

function MetaField({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: "emerald";
}) {
  const accentCls = accent === "emerald" ? "text-emerald-700" : "text-ink-900";
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
        {label}
      </div>
      <div className={`mt-0.5 text-sm ${mono ? "font-mono" : "font-semibold"} ${accentCls}`}>
        {value}
      </div>
    </div>
  );
}

function IdentityCard({ enrichment }: { enrichment: EnrichmentResult }) {
  const { avatarUrl, displayName, bio, publicLinks } = enrichment;
  return (
    <div className="flex items-start gap-4 rounded-xl border border-ink-900/10 bg-white p-4 shadow-sm">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-ink-900/10"
        />
      ) : (
        <div className="h-16 w-16 shrink-0 rounded-xl bg-ink-900/5" />
      )}
      <div className="min-w-0 flex-1">
        {displayName ? (
          <div className="text-base font-bold text-ink-900">{displayName}</div>
        ) : null}
        {bio ? <div className="mt-1 text-sm text-ink-700">{bio}</div> : null}
        {publicLinks && publicLinks.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {publicLinks.slice(0, 5).map((u) => (
              <a
                key={u}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-ink-900/[0.04] px-2.5 py-1 text-[11px] font-semibold text-ink-800 hover:bg-brand-100"
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

function PresenceGrid({ hits }: { hits: UsernameHit[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {hits.map((h) => (
        <a
          key={h.site}
          href={h.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border border-ink-900/5 bg-white px-3 py-2 text-xs font-semibold text-ink-800 shadow-sm hover:border-brand-500/40 hover:bg-brand-50"
        >
          <span className="truncate">{h.site}</span>
          <svg viewBox="0 0 24 24" className="ml-1 h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 17 10-10M17 7H8M17 7v9" />
          </svg>
        </a>
      ))}
    </div>
  );
}

function BreachBody({ breaches, count }: { breaches: BreachHit[]; count?: number }) {
  if (count === 0 && (!breaches || breaches.length === 0)) {
    return (
      <EmptyNote
        variant="confirmed-none"
        subject="data-breach exposure"
        customText="We have confirmed that no public breach data has been found for this subject. This search is backed by Have I Been Pwned's public breach index and is re-run on every lookup."
      />
    );
  }
  if (!breaches || breaches.length === 0) {
    return <EmptyNote variant="inconclusive" subject="data-breach exposure" />;
  }
  return (
    <div className="rounded-xl border border-rose-500/25 bg-rose-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-rose-900">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        Appears in {breaches.length} public breach
        {breaches.length === 1 ? "" : "es"}
      </div>
      <ul className="mt-3 space-y-2">
        {breaches.slice(0, 10).map((b) => (
          <li key={b.name} className="rounded-lg border border-rose-500/15 bg-white p-3 text-sm">
            <div className="font-semibold text-ink-900">{b.name}</div>
            {b.date ? (
              <div className="text-xs text-ink-500">Breached {b.date}</div>
            ) : null}
            {b.dataClasses && b.dataClasses.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {b.dataClasses.slice(0, 6).map((dc) => (
                  <span
                    key={dc}
                    className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800"
                  >
                    {dc}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {breaches.length > 10 ? (
        <div className="mt-2 text-xs text-rose-800">
          …and {breaches.length - 10} more
        </div>
      ) : null}
    </div>
  );
}

function SourcesList({ sources }: { sources: EnrichmentResult["sources"] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((s, i) => (
        <span
          key={`${s.provider}-${i}`}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            s.ok
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/25"
              : "bg-ink-900/[0.04] text-ink-500 ring-1 ring-ink-900/10"
          }`}
        >
          <span className={`h-1 w-1 rounded-full ${s.ok ? "bg-emerald-600" : "bg-ink-400"}`} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function ReportFooter({
  issuedAt,
  reportId,
  subject,
}: {
  issuedAt: string;
  reportId: string;
  subject: string;
}) {
  return (
    <div className="rounded-b-2xl border border-t-0 border-ink-900/10 bg-ink-900 px-6 py-6 text-xs leading-relaxed text-ink-300 sm:px-8">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="font-serif text-sm font-semibold text-white" style={{ fontFamily: "var(--font-report-serif), Georgia, serif" }}>
          {brand.name}
        </div>
        <div className="font-mono text-[10px] text-white/60">
          Report {reportId} · {issuedAt}
        </div>
      </div>
      <p className="mt-4">
        This document was compiled from publicly available information and
        licensed data providers. {brand.name} is not a consumer reporting
        agency as defined by the Fair Credit Reporting Act (15 U.S.C. § 1681
        et seq.). This report MUST NOT be used, in whole or in part, to make
        decisions about employment, tenancy, credit, insurance, or any other
        purpose that would require a consumer report under the FCRA.
      </p>
      <p className="mt-3 text-ink-400">
        Subject on record: <code className="font-mono text-ink-200">{subject}</code>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

function pickIdentity(enrichment?: EnrichmentResult) {
  const hasAny = Boolean(
    enrichment?.displayName || enrichment?.bio || enrichment?.avatarUrl,
  );
  return { hasAny, displayName: enrichment?.displayName };
}

function breachStatus(
  breaches: BreachHit[],
  count: number | undefined,
): SectionStatus {
  if (count === 0 && (!breaches || breaches.length === 0)) return "confirmed-none";
  if (breaches && breaches.length > 0) return "found";
  return "inconclusive";
}

function formatCountry(phone: PhoneLookupResult): string {
  if (!phone.country) return "—";
  return `${phone.country}${phone.countryCode ? ` (${phone.countryCode})` : ""}`;
}

function buildReportId(query: string): string {
  // Deterministic short id from the queried subject so a user re-opening the
  // same report sees the same id — stable, non-sensitive, 10 chars.
  let h = 0;
  for (let i = 0; i < query.length; i++) {
    h = (h * 31 + query.charCodeAt(i)) | 0;
  }
  const base = Math.abs(h).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  const year = new Date().getUTCFullYear().toString().slice(-2);
  return `TC-${year}-${base}`;
}

function formatDocDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/* Inline icons (small set, hand-drawn to stay 2 KB)                  */
/* ------------------------------------------------------------------ */

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="7" y="4" width="10" height="4" rx="1" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M17 6h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}

function IconHourglass() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 5 10 5 10 9s-10 4-10 9" />
      <path d="M17 3c0 5-10 5-10 9s10 4 10 9" />
    </svg>
  );
}

function IconShieldCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SealMark() {
  return (
    <div className="relative grid h-20 w-20 place-items-center rounded-full border-2 border-brand-700 text-brand-700">
      <div className="text-center text-[9px] font-semibold uppercase tracking-[0.14em] leading-tight">
        {brand.name}
        <br />
        Verified
        <br />
        Report
      </div>
    </div>
  );
}
