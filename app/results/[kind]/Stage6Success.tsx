"use client";

import type { PhoneLookupResult } from "@/lib/phone";
import type { EmailLookupResult } from "@/lib/email";

type Props =
  | { kind: "phone"; query: string; phone: PhoneLookupResult; email: EmailLookupResult | null }
  | { kind: "email"; query: string; phone: PhoneLookupResult | null; email: EmailLookupResult };

export function Stage6Success(props: Props) {
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
        This is a preview of what the full paid report would show. The demo
        surfaces the metadata we can derive without a paid data provider.
      </p>

      {props.kind === "phone" && props.phone ? (
        <PhoneCard result={props.phone} />
      ) : null}
      {props.kind === "email" && props.email ? (
        <EmailCard result={props.email} />
      ) : null}

      <div className="mt-8 rounded-2xl border border-ink-900/5 bg-ink-900/[0.03] p-5 text-sm text-ink-700">
        <div className="font-semibold text-ink-900">What&apos;s next</div>
        <p className="mt-2">
          Wire up a real data provider (Endato, PeopleDataLabs, Enformion) and
          the fields below fill in with real owner data. Ping me when you have
          an API key and I&apos;ll integrate it.
        </p>
      </div>
    </section>
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
            result.breachCount === null
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
