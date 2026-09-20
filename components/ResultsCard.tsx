import Link from "next/link";
import { brand } from "@/lib/brand";
import type { PhoneLookupResult } from "@/lib/phone";
import type { EmailLookupResult } from "@/lib/email";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-ink-900/5 py-3 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-ink-900">{value}</div>
    </div>
  );
}

function BlurredField({ label }: { label: string }) {
  return (
    <div className="border-b border-ink-900/5 py-3 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-400">{label}</div>
      <div className="mt-0.5 select-none text-sm font-medium text-ink-900/80 blur-sm">
        ████████████████████
      </div>
    </div>
  );
}

export function PhoneResults({ result }: { result: PhoneLookupResult }) {
  if (!result.valid) {
    return (
      <div className="rounded-2xl border border-amber-400/40 bg-amber-50 p-6 text-amber-900">
        <div className="font-semibold">We couldn&apos;t parse that number.</div>
        <div className="mt-1 text-sm">
          Double-check the digits — most numbers work best in international
          format (e.g. <code>+1 415 555 0134</code>).
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.34 1.88.63 2.77a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.31-1.31a2 2 0 0 1 2.11-.45c.89.29 1.82.5 2.77.63A2 2 0 0 1 22 16.92z" />
            </svg>
          </span>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-400">Number</div>
            <div className="text-xl font-semibold">{result.international}</div>
          </div>
        </div>

        <Field label="Country" value={`${result.country ?? "—"} (${result.countryCode ?? "—"})`} />
        <Field label="Region" value={result.region ?? "Not identified"} />
        <Field
          label="Likely city"
          value={result.citiesHint?.length ? result.citiesHint.join(", ") : "Not identified"}
        />
        <Field label="Line type" value={result.carrierHint ?? "Unknown"} />
        <Field label="National format" value={result.national ?? "—"} />
        <Field label="E.164" value={<code className="text-xs">{result.e164}</code>} />
      </div>

      <PaywallCard kind="phone" />
    </div>
  );
}

export function EmailResults({ result }: { result: EmailLookupResult }) {
  if (!result.valid) {
    return (
      <div className="rounded-2xl border border-amber-400/40 bg-amber-50 p-6 text-amber-900">
        <div className="font-semibold">That doesn&apos;t look like a valid email.</div>
        <div className="mt-1 text-sm">
          Check for typos, missing <code>@</code>, or a missing domain.
        </div>
      </div>
    );
  }

  const badges: { label: string; tone: "green" | "amber" | "red" | "slate" }[] = [];
  if (result.disposable) badges.push({ label: "Disposable / burner", tone: "red" });
  if (result.role) badges.push({ label: "Role account", tone: "amber" });
  if (result.free) badges.push({ label: "Free provider", tone: "slate" });
  if (!result.disposable && !result.role) badges.push({ label: "Real-looking address", tone: "green" });

  const toneClass: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-800 ring-emerald-500/20",
    amber: "bg-amber-50 text-amber-900 ring-amber-500/20",
    red: "bg-rose-50 text-rose-800 ring-rose-500/20",
    slate: "bg-ink-900/5 text-ink-700 ring-ink-900/10",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-400">Email</div>
            <div className="text-xl font-semibold break-all">{result.normalized}</div>
          </div>
        </div>

        {badges.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.label}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClass[b.tone]}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        ) : null}

        <Field label="Local part" value={result.local ?? "—"} />
        <Field label="Domain" value={result.domain ?? "—"} />
        <Field label="Provider" value={result.provider ?? "Custom / self-hosted"} />
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
        <BlurredField label="Full name on record" />
        <BlurredField label="Linked social profiles" />
        <BlurredField label="Dating site presence" />
      </div>

      <PaywallCard kind="email" />
    </div>
  );
}

function PaywallCard({ kind }: { kind: "phone" | "email" }) {
  const items =
    kind === "phone"
      ? [
          "Owner name & aliases",
          "Address history",
          "Linked emails",
          "Social & dating profiles",
          "Spam & scam reports",
          "Related people",
        ]
      : [
          "Owner name & aliases",
          "Linked phone numbers",
          "Social & dating profiles",
          "Domain & business ownership",
          "Full breach & password exposure history",
          "Forum & marketplace activity",
        ];

  return (
    <aside className="rounded-2xl border border-brand-500/20 bg-gradient-to-b from-brand-50 to-white p-6 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
        Match found
      </div>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">
        Unlock the full report
      </h2>
      <p className="mt-1 text-sm text-ink-500">
        See everything we found about this {kind}. Start a {brand.trialDurationDays}-day trial for <strong className="text-ink-900">${brand.trialPrice.toFixed(0)}</strong>, then <strong className="text-ink-900">${brand.monthlyPrice}/mo</strong>.
      </p>

      <ul className="mt-4 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2 text-sm text-ink-700">
            <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {it}
          </li>
        ))}
      </ul>

      <Link
        href="/signup"
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        Unlock full report — ${brand.trialPrice.toFixed(0)} trial
      </Link>
      <p className="mt-2 text-center text-xs text-ink-400">
        Cancel anytime. Secure checkout.
      </p>
    </aside>
  );
}
