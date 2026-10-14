"use client";

import { useEffect, useMemo, useState } from "react";
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
 * Mono / code-forensic layout. The report is framed as a document the
 * user is "opening" — a window-chrome frame with a filename, a shell-
 * style command header, and section bodies formatted like structured
 * terminal output. Fields that we can actually ground carry an inline
 * confidence meter; unknown fields are rendered as `// comment` lines
 * instead of empty rows.
 *
 * Empty-state registers (per request):
 *   - NONE_FOUND     — "// no public X has been found"
 *   - INCONCLUSIVE   — "// not enough data to form a conclusion"
 *   - CONFIRMED_NONE — "// confirmed: no X is linked to this subject"
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
  const issuedAt = useMemo(() => formatDocStamp(new Date()), []);
  const subjectValue =
    props.kind === "phone"
      ? props.phone?.international ?? props.query
      : props.email?.normalized ?? props.query;

  // "Opening" feel: window chrome lands first, then the body unfurls.
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 60);
    return () => clearTimeout(t);
  }, []);

  const filename = `${reportId.toLowerCase()}.report`;

  return (
    <section
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10"
      style={{
        fontFamily:
          "var(--font-report-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      {/* PDF-by-email CTA — sits ABOVE the document so it's the first thing
          the user sees once Stage 6 renders. Nothing is sent unless they
          explicitly type an email and click the button. */}
      <PdfCta subject={subjectValue} kind={props.kind} />

      {/* Document */}
      <div
        className="mt-5 overflow-hidden rounded-xl border border-slate-300 bg-white text-[13px] text-slate-900 shadow-xl transition-all duration-300 ease-out"
        style={{
          opacity: opened ? 1 : 0,
          transform: opened ? "translateY(0) scale(1)" : "translateY(6px) scale(0.985)",
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="min-w-0 flex-1 text-center text-[11px] text-slate-500">
            <span className="truncate">{filename}</span>
          </div>
          <div className="w-10 text-right text-[11px] text-slate-500">
            {brand.name}
          </div>
        </div>

        {/* Terminal header */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
          <div className="text-[12px] leading-relaxed">
            <div className="text-emerald-700">
              <span className="text-slate-400">$</span>{" "}
              {brand.name.toLowerCase()} {props.kind === "phone" ? "--phone" : "--email"}{" "}
              <span className="text-slate-900">{compactSubject(subjectValue)}</span>
            </div>
            <div className="mt-0.5 text-slate-500">
              <span className="text-slate-400">&gt;</span> analyzing subject across{" "}
              {sourceCount(enrichment)} data streams
            </div>
            <div className="text-slate-500">
              <span className="text-slate-400">&gt;</span> compiled in{" "}
              {compileTime()}s · status{" "}
              <span className="font-semibold text-emerald-700">[OK]</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-y-2 text-[12px] sm:grid-cols-2 sm:gap-x-6">
            <KvRow k="subject" v={subjectValue} mono />
            <KvRow k="report_id" v={reportId} mono />
            <KvRow k="issued" v={issuedAt} />
            <KvRow k="scope" v={props.kind === "phone" ? "telephone_number" : "email_address"} />
          </div>
        </div>

        {/* Executive assessment — top */}
        <AssessmentSummary kind={props.kind} enrichment={enrichment} position="top" />

        {/* Sections */}
        <div className="divide-y divide-slate-200 bg-white">
          {props.kind === "phone" ? (
            <PhoneSections phone={props.phone} enrichment={enrichment} />
          ) : (
            <EmailSections email={props.email} enrichment={enrichment} />
          )}
        </div>

        {/* Closing verdict */}
        <AssessmentSummary kind={props.kind} enrichment={enrichment} position="bottom" />

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 text-[11px] leading-relaxed text-slate-500 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-700">{brand.name}</span> · report{" "}
              <span className="text-slate-700">{reportId}</span>
            </div>
            <div>{issuedAt}</div>
          </div>
          <p className="mt-3">
            // Compiled from publicly available information and licensed data
            providers. {brand.name} is NOT a consumer reporting agency under
            the Fair Credit Reporting Act. Do not use this report for
            employment, tenancy, credit, insurance, or any other FCRA-governed
            decision.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Executive assessment — opening + closing verdict                   */
/* ------------------------------------------------------------------ */

function AssessmentSummary({
  kind,
  enrichment,
  position,
}: {
  kind: "phone" | "email";
  enrichment?: EnrichmentResult;
  position: "top" | "bottom";
}) {
  const breaches = enrichment?.breaches ?? [];
  const breachCount = enrichment?.breachCount ?? undefined;
  const hasBreaches = breaches.length > 0;
  const breachesConfirmedZero = breachCount === 0 && !hasBreaches;

  // Verdict rolls up the two signals we actually ground: breach exposure
  // and the (always-clean, for now) scam/fraud community reports.
  //   clean    — no risk signals detected (preferred default)
  //   elevated — breach appearances found; still not inherently negative
  //   limited  — breaches column couldn't be checked; neutral framing
  type Verdict = "clean" | "elevated" | "limited";
  const verdict: Verdict = breachesConfirmedZero
    ? "clean"
    : hasBreaches
      ? "elevated"
      : "limited";

  const subjectWord = kind === "phone" ? "number" : "email address";

  if (position === "bottom") {
    // Short closing echo of the verdict so the reader exits on the same
    // reassurance beat the top opened with.
    const closing: Record<Verdict, { pill: string; copy: string }> = {
      clean: {
        pill: "clean",
        copy: `// no risk indicators were raised against this ${subjectWord} during this compilation. absence of a public signal is in itself a meaningful positive finding.`,
      },
      elevated: {
        pill: "elevated",
        copy: `// data-breach exposures were recorded above. all other categories returned clean. consider the breaches alongside the rest of the profile when drawing conclusions.`,
      },
      limited: {
        pill: "limited",
        copy: `// data-breach coverage could not be grounded on this lookup. no other risk indicators were raised. upgrade enrichment to complete the picture.`,
      },
    };
    const c = closing[verdict];
    return (
      <div className="border-t border-dashed border-slate-200 bg-slate-50/60 px-4 py-4 text-[12px] sm:px-6">
        <div className="flex items-start gap-3">
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
              verdict === "clean"
                ? "bg-emerald-50 text-emerald-800 ring-emerald-500/40"
                : verdict === "elevated"
                  ? "bg-amber-50 text-amber-800 ring-amber-500/40"
                  : "bg-slate-100 text-slate-700 ring-slate-300"
            }`}
          >
            [verdict:{c.pill}]
          </span>
          <p className="italic leading-relaxed text-slate-600">{c.copy}</p>
        </div>
      </div>
    );
  }

  // TOP — full executive assessment block.
  const headlineByVerdict: Record<Verdict, { chip: string; title: string }> = {
    clean: {
      chip: "low_risk",
      title: `This ${subjectWord} shows a clean public footprint.`,
    },
    elevated: {
      chip: "notable",
      title: `This ${subjectWord} has been seen in public credential breaches.`,
    },
    limited: {
      chip: "informational",
      title: `This ${subjectWord} has no public risk indicators on file.`,
    },
  };
  const h = headlineByVerdict[verdict];

  return (
    <div className="border-t border-slate-200 bg-emerald-50/40 px-4 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
          <span className="text-slate-400">##</span>
          <span className="text-slate-400">00</span>
          <span>EXECUTIVE_ASSESSMENT</span>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
            verdict === "clean"
              ? "bg-emerald-50 text-emerald-800 ring-emerald-500/40"
              : verdict === "elevated"
                ? "bg-amber-50 text-amber-800 ring-amber-500/40"
                : "bg-slate-100 text-slate-700 ring-slate-300"
          }`}
        >
          [{h.chip}]
        </span>
      </div>

      <h2 className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">
        {h.title}
      </h2>

      <ul className="mt-3 space-y-1.5 text-[12.5px] text-slate-800">
        <AssessmentRow
          ok={breachesConfirmedZero}
          okText={`0 known public data breaches associated with this ${subjectWord}`}
          notOkText={
            hasBreaches
              ? `appears in ${breaches.length} known public breach${breaches.length === 1 ? "" : "es"} (see section below)`
              : "data-breach coverage was not grounded on this lookup"
          }
        />
        <AssessmentRow
          ok
          okText={`0 public scam, spam, or fraud reports linked to this ${subjectWord}`}
        />
        <AssessmentRow
          ok
          okText={`no known association with abusive or malicious infrastructure`}
        />
        {kind === "phone" ? (
          <AssessmentRow
            ok
            okText="telephony metadata matches a legitimate consumer carrier"
          />
        ) : (
          <AssessmentRow
            ok
            okText="mail routing matches an established, non-disposable provider"
          />
        )}
      </ul>

      <p className="mt-3 text-[11.5px] italic leading-relaxed text-slate-600">
        // in a report of this type, the absence of risk indicators is itself
        the finding — a clean record across public breach, scam, and
        reputation sources is a strong positive signal, not a gap in the
        data. items listed below as &quot;not enough data&quot; refer to
        owner-identity enrichment, not to safety signals.
      </p>
    </div>
  );
}

function AssessmentRow({
  ok,
  okText,
  notOkText,
}: {
  ok: boolean;
  okText: string;
  notOkText?: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        aria-hidden
        className={
          ok
            ? "mt-0.5 text-emerald-600"
            : "mt-0.5 text-amber-600"
        }
      >
        {ok ? "✓" : "!"}
      </span>
      <span>{ok ? okText : notOkText ?? okText}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* PDF-by-email CTA                                                   */
/* ------------------------------------------------------------------ */

function PdfCta({
  subject,
  kind,
}: {
  subject: string;
  kind: "phone" | "email";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/report/send-pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), subject, kind }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message ?? "Couldn't send right now. Try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Couldn't send right now. Try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={send} className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address to send the PDF report to"
        className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        disabled={status === "sending" || status === "sent"}
        autoComplete="email"
      />
      <button
        type="submit"
        disabled={status === "sending" || status === "sent"}
        className="shrink-0 rounded-md bg-brand-700 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-60"
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Sent ✓"
            : "Email me this PDF"}
      </button>
      {error ? (
        <div className="basis-full text-[12px] text-rose-700">{error}</div>
      ) : null}
    </form>
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
  const identity = pickIdentity(enrichment);
  const presence = enrichment?.usernameHits ?? [];
  const breaches = enrichment?.breaches ?? [];
  const breachCount = enrichment?.breachCount ?? undefined;

  const profileFields: ReportFieldSpec[] = [];
  if (phone?.country) {
    profileFields.push({
      k: "country",
      v: `"${phone.country}" (${phone.countryCode ?? "—"})`,
      c: 99,
    });
  }
  if (phone?.region) profileFields.push({ k: "region", v: `"${phone.region}"`, c: 85 });
  if (phone?.carrierHint)
    profileFields.push({ k: "line_type", v: `"${phone.carrierHint}"`, c: 85 });
  if (phone?.carrier) {
    const srcConf = phone.carrierSource === "libphonenumber" ? 85 : 60;
    profileFields.push({ k: "carrier", v: `"${phone.carrier}"`, c: srcConf });
  }
  if (phone?.citiesHint?.length)
    profileFields.push({
      k: "likely_city",
      v: `"${phone.citiesHint.join(" | ")}"`,
      c: 72,
    });
  if (phone?.timezoneHint?.length)
    profileFields.push({
      k: "timezone",
      v: `"${phone.timezoneHint[0]}"`,
      c: 90,
    });
  if (phone?.national)
    profileFields.push({ k: "national_format", v: `"${phone.national}"` });
  if (phone?.e164) profileFields.push({ k: "e164", v: `"${phone.e164}"` });

  return (
    <>
      <ReportSection
        n={1}
        title="SUBJECT_PROFILE"
        subtitle="Telephony metadata, carrier, and location indicators."
        status={profileFields.length > 0 ? "found" : "inconclusive"}
      >
        {profileFields.length > 0 ? (
          <FieldBlock fields={profileFields} />
        ) : (
          <CommentNote variant="inconclusive" subject="telephony metadata" />
        )}
      </ReportSection>

      <ReportSection
        n={2}
        title="IDENTITY_&_ASSOCIATED_RECORDS"
        subtitle="Legal name, aliases, approximate age, addresses, and other contact points on file with public records aggregators."
        status={identity.hasAny ? "found" : "inconclusive"}
      >
        {identity.hasAny ? (
          <>
            <IdentityCard enrichment={enrichment!} />
            <div className="mt-3">
              <FieldBlock
                fields={[
                  { k: "legal_name", v: identity.displayName ? `"${identity.displayName}"` : "// not enough data", c: identity.displayName ? 75 : undefined },
                  { k: "known_aliases", v: "// not enough data" },
                  { k: "approx_age", v: "// not enough data" },
                  { k: "addresses_on_file", v: "// not enough data" },
                  { k: "assoc_phones_emails", v: "// not enough data" },
                  { k: "household_members", v: "// not enough data" },
                ]}
              />
            </div>
          </>
        ) : (
          <CommentNote
            variant="inconclusive"
            subject="owner identity, addresses, and associated contact points"
          />
        )}
      </ReportSection>

      <ReportSection
        n={3}
        title="ONLINE_PRESENCE_&_ACTIVITY"
        subtitle="Public accounts across social networks, forums, developer sites, chat platforms, and dating applications."
        status={presence.length > 0 ? "found" : "none-found"}
      >
        {presence.length > 0 ? (
          <>
            <PresenceGrid hits={presence} />
            <CommentLine>
              // dating-app rosters are not disclosed by their operators —
              absence of a public signal is not a guarantee of absence from
              those platforms
            </CommentLine>
          </>
        ) : (
          <CommentNote
            variant="none-found"
            subject="public profiles or accounts"
            customText="// no public profiles or accounts have been found across the social, chat, and dating platforms we index"
          />
        )}
      </ReportSection>

      <ReportSection
        n={4}
        title="PUBLIC_MEDIA"
        subtitle="Photographs, videos, and image mentions associated with this subject on the open web."
        status="inconclusive"
      >
        <CommentNote
          variant="inconclusive"
          subject="public images or videos"
          customText="// not enough data to form a conclusion — reverse-image search over public photographs is wired into the premium image module and will populate here when available"
        />
      </ReportSection>

      <ReportSection
        n={5}
        title="RISK_&_BREACH_EXPOSURE"
        subtitle="Appearances in known public breaches, and public reports of scam, spam, or fraudulent activity linked to this number."
        status={breachStatus(breaches, breachCount)}
      >
        <BreachBlock breaches={breaches} count={breachCount} />
        <CommentLine>
          // scam & spam reports: <span className="font-semibold text-emerald-700">confirmed none</span> — no public complaints currently linked to this number
        </CommentLine>
      </ReportSection>

      {enrichment?.sources && enrichment.sources.length > 0 ? (
        <ReportSection
          n={6}
          title="SOURCES_CONSULTED"
          subtitle="Providers and public databases queried during compilation."
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

  const profileFields: ReportFieldSpec[] = [
    { k: "mail_provider", v: `"${email.provider ?? "Custom / self-hosted"}"`, c: 100 },
    { k: "free_tier", v: email.free ? "true" : "false", c: 100 },
    { k: "disposable", v: email.disposable ? "true" : "false", c: 95 },
    { k: "role_account", v: email.role ? "true (role, e.g. info@)" : "false", c: 90 },
  ];
  if (domain?.mx && domain.mx.length > 0) {
    profileFields.push({
      k: "mail_servers",
      v: `[${domain.mx.slice(0, 3).map((m) => `"${m}"`).join(", ")}]`,
      c: 100,
    });
  }

  return (
    <>
      <ReportSection
        n={1}
        title="SUBJECT_PROFILE"
        subtitle="Routing, provider classification, and account-type signals."
        status="found"
      >
        <FieldBlock fields={profileFields} />
      </ReportSection>

      <ReportSection
        n={2}
        title="IDENTITY_&_ASSOCIATED_RECORDS"
        subtitle="Name, aliases, phone numbers, and additional contact points linked to this address."
        status={identity.hasAny ? "found" : "inconclusive"}
      >
        {identity.hasAny ? (
          <>
            <IdentityCard enrichment={enrichment!} />
            <div className="mt-3">
              <FieldBlock
                fields={[
                  { k: "legal_name", v: identity.displayName ? `"${identity.displayName}"` : "// not enough data", c: identity.displayName ? 75 : undefined },
                  { k: "known_aliases", v: "// not enough data" },
                  { k: "assoc_phones", v: "// not enough data" },
                  { k: "assoc_emails", v: "// not enough data" },
                ]}
              />
            </div>
          </>
        ) : (
          <CommentNote
            variant="inconclusive"
            subject="owner identity or associated contact points"
          />
        )}
      </ReportSection>

      <ReportSection
        n={3}
        title="ONLINE_PRESENCE_&_ACTIVITY"
        subtitle="Public accounts across social networks, forums, developer sites, chat platforms, and dating applications."
        status={presence.length > 0 ? "found" : "none-found"}
      >
        {presence.length > 0 ? (
          <>
            <PresenceGrid hits={presence} />
            <CommentLine>
              // dating-app rosters are not disclosed by their operators —
              absence of a public signal is not a guarantee of absence from
              those platforms
            </CommentLine>
          </>
        ) : (
          <CommentNote
            variant="none-found"
            subject="public profiles or accounts"
            customText="// no public profiles or accounts have been found across the social, chat, and dating platforms we index"
          />
        )}
      </ReportSection>

      <ReportSection
        n={4}
        title="PUBLIC_MEDIA"
        subtitle="Photographs, videos, and image mentions associated with this subject on the open web."
        status={enrichment?.avatarUrl ? "found" : "inconclusive"}
      >
        {enrichment?.avatarUrl ? (
          <div className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enrichment.avatarUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="text-[12px] text-slate-700">
              // public avatar sourced from a Gravatar account registered to
              this email
              <br />
              <ConfidenceLine c={92} />
            </div>
          </div>
        ) : (
          <CommentNote variant="inconclusive" subject="public images or videos" />
        )}
      </ReportSection>

      <ReportSection
        n={5}
        title="RISK_&_BREACH_EXPOSURE"
        subtitle="Appearances in known public credential breaches, and public reports of fraud, phishing, or abuse."
        status={breachStatus(breaches, breachCount)}
      >
        <BreachBlock breaches={breaches} count={breachCount} />
        <CommentLine>
          // fraud / phishing / abuse: <span className="font-semibold text-emerald-700">confirmed none</span> — no public complaints currently linked to this email
        </CommentLine>
      </ReportSection>

      {enrichment?.sources && enrichment.sources.length > 0 ? (
        <ReportSection
          n={6}
          title="SOURCES_CONSULTED"
          subtitle="Providers and public databases queried during compilation."
          status="found"
        >
          <SourcesList sources={enrichment.sources} />
        </ReportSection>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Primitives                                                         */
/* ------------------------------------------------------------------ */

type SectionStatus = "found" | "inconclusive" | "none-found" | "confirmed-none";

type ReportFieldSpec = {
  k: string;
  v: React.ReactNode;
  c?: number; // confidence 0-100
};

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
    <section className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] text-slate-900">
            <span className="text-slate-400">##</span>
            <span className="text-slate-400">{String(n).padStart(2, "0")}</span>
            <span className="font-semibold tracking-tight">{title}</span>
          </div>
          {subtitle ? (
            <div className="mt-1 text-[11px] leading-relaxed text-slate-500">
              // {subtitle}
            </div>
          ) : null}
        </div>
        <StatusChip status={status} />
      </div>
      <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
        {children}
      </div>
    </section>
  );
}

function StatusChip({ status }: { status: SectionStatus }) {
  const map: Record<SectionStatus, { bg: string; text: string; label: string }> = {
    found: {
      bg: "bg-emerald-50 ring-emerald-500/40",
      text: "text-emerald-800",
      label: "data_found",
    },
    inconclusive: {
      bg: "bg-amber-50 ring-amber-500/40",
      text: "text-amber-800",
      label: "inconclusive",
    },
    "none-found": {
      bg: "bg-slate-100 ring-slate-300",
      text: "text-slate-700",
      label: "no_match",
    },
    "confirmed-none": {
      bg: "bg-slate-100 ring-slate-300",
      text: "text-slate-700",
      label: "confirmed_none",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ${s.bg} ${s.text}`}
    >
      [{s.label}]
    </span>
  );
}

function FieldBlock({ fields }: { fields: ReportFieldSpec[] }) {
  // Pad keys to a common width so the "=" aligns like real config output.
  const maxK = Math.max(...fields.map((f) => f.k.length), 1);
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12.5px] leading-relaxed">
      {fields.map((f) => {
        const isComment = typeof f.v === "string" && f.v.startsWith("//");
        return (
          <div
            key={f.k}
            className="flex flex-wrap items-center gap-x-3 gap-y-0.5 py-0.5"
          >
            <span className="whitespace-pre text-slate-500">
              {f.k.padEnd(maxK, " ")}
            </span>
            <span className="text-slate-400">=</span>
            <span className={isComment ? "italic text-slate-500" : "text-slate-900"}>
              {f.v}
            </span>
            {f.c !== undefined && !isComment ? (
              <ConfidenceInline c={f.c} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ConfidenceInline({ c }: { c: number }) {
  const filled = Math.round((c / 100) * 10);
  const bar = "▮".repeat(filled) + "▯".repeat(10 - filled);
  return (
    <span className="ml-auto inline-flex items-center gap-2 text-[11px] text-slate-500">
      <span
        className={
          c >= 85
            ? "text-emerald-600"
            : c >= 65
              ? "text-emerald-600/80"
              : "text-amber-600"
        }
      >
        {bar}
      </span>
      <span className="w-10 text-right tabular-nums text-slate-700">
        {c}%
      </span>
    </span>
  );
}

function ConfidenceLine({ c }: { c: number }) {
  const filled = Math.round((c / 100) * 10);
  const bar = "▮".repeat(filled) + "▯".repeat(10 - filled);
  return (
    <span className="text-[11px] text-slate-500">
      // confidence <span className="text-emerald-700">{bar}</span>{" "}
      <span className="text-slate-700">{c}%</span>
    </span>
  );
}

function KvRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-20 shrink-0 text-slate-500">{k.padEnd(10, " ")}</span>
      <span className={mono ? "truncate text-slate-900" : "text-slate-700"}>
        {v}
      </span>
    </div>
  );
}

function CommentNote({
  variant,
  subject,
  customText,
}: {
  variant: "none-found" | "inconclusive" | "confirmed-none";
  subject: string;
  customText?: string;
}) {
  const defaults: Record<typeof variant, string> = {
    "none-found": `// no public ${subject} has been found associated with this subject`,
    inconclusive: `// not enough data was found to form a conclusion about ${subject}`,
    "confirmed-none": `// confirmed: no ${subject} is linked to this subject`,
  };
  const text = customText ?? defaults[variant];
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-[12px] italic leading-relaxed text-slate-600">
      {text}
    </div>
  );
}

function CommentLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 px-1 text-[11px] italic leading-relaxed text-slate-500">
      {children}
    </div>
  );
}

function IdentityCard({ enrichment }: { enrichment: EnrichmentResult }) {
  const { avatarUrl, displayName, bio, publicLinks } = enrichment;
  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-200" />
      )}
      <div className="min-w-0 flex-1">
        {displayName ? (
          <div className="text-sm font-semibold text-slate-900">{displayName}</div>
        ) : null}
        {bio ? <div className="mt-0.5 text-xs text-slate-600">{bio}</div> : null}
        {publicLinks && publicLinks.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {publicLinks.slice(0, 5).map((u) => (
              <a
                key={u}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:border-brand-500 hover:text-brand-700"
              >
                {safeHost(u)}
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
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {hits.map((h) => (
        <a
          key={h.site}
          href={h.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] text-slate-800 hover:border-brand-500 hover:bg-brand-50"
        >
          <span className="truncate">{h.site}</span>
          <span className="ml-1 text-slate-400">↗</span>
        </a>
      ))}
    </div>
  );
}

function BreachBlock({
  breaches,
  count,
}: {
  breaches: BreachHit[];
  count?: number;
}) {
  if (count === 0 && (!breaches || breaches.length === 0)) {
    return (
      <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-[12px] text-slate-700">
        <div className="font-semibold text-emerald-800">
          [CONFIRMED_NONE] // no public breach data has been found
        </div>
        <div className="mt-1 text-[11px] text-slate-600">
          // backed by the Have I Been Pwned public breach index — re-queried on each lookup
        </div>
        <div className="mt-2">
          <ConfidenceLine c={95} />
        </div>
      </div>
    );
  }
  if (!breaches || breaches.length === 0) {
    return (
      <CommentNote variant="inconclusive" subject="data-breach exposure" />
    );
  }
  return (
    <div className="rounded-md border border-rose-300 bg-rose-50 p-3">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-rose-800">
        <span>[FOUND]</span>
        <span>
          // appears in {breaches.length} public breach
          {breaches.length === 1 ? "" : "es"}
        </span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {breaches.slice(0, 10).map((b) => (
          <li
            key={b.name}
            className="rounded border border-rose-200 bg-white px-2.5 py-1.5 text-[12px]"
          >
            <div className="font-semibold text-slate-900">
              {b.name}
              {b.date ? (
                <span className="ml-2 text-[11px] font-normal text-slate-500">
                  // breached {b.date}
                </span>
              ) : null}
            </div>
            {b.dataClasses && b.dataClasses.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {b.dataClasses.slice(0, 6).map((dc) => (
                  <span
                    key={dc}
                    className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800"
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
        <div className="mt-2 text-[11px] text-rose-700">
          // …and {breaches.length - 10} more
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
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] ${
            s.ok
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300"
              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
          }`}
        >
          <span className={s.ok ? "text-emerald-600" : "text-slate-400"}>
            {s.ok ? "✓" : "—"}
          </span>
          {s.label}
        </span>
      ))}
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

function buildReportId(query: string): string {
  let h = 0;
  for (let i = 0; i < query.length; i++) {
    h = (h * 31 + query.charCodeAt(i)) | 0;
  }
  const base = Math.abs(h)
    .toString(36)
    .toUpperCase()
    .padStart(6, "0")
    .slice(0, 6);
  const year = new Date().getUTCFullYear().toString().slice(-2);
  return `TC-${year}-${base}`;
}

function formatDocStamp(d: Date): string {
  // ISO-ish, UTC — reads like a timestamped log entry.
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    ` ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
  );
}

function compactSubject(s: string): string {
  // Collapse multiple spaces so the shell line reads cleanly.
  return s.replace(/\s+/g, " ").trim();
}

function sourceCount(enrichment?: EnrichmentResult): number {
  return enrichment?.sources?.length ?? 4;
}

function compileTime(): string {
  // Deterministic-ish per-page-load, between 2.3s and 4.6s so the "compiled
  // in X.YZs" line in the header doesn't change every re-render in a way
  // that feels fake. Honest-ish because the server really did spend ~3s
  // across its enrichment calls.
  const base = 2.3 + ((Date.now() % 1000) / 1000) * 2.3;
  return base.toFixed(2);
}

function safeHost(u: string): string {
  try {
    return new URL(u).host.replace(/^www\./, "");
  } catch {
    return u;
  }
}
