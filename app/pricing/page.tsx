import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Pricing — ${brand.name}`,
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          One plan. Unlimited lookups.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-ink-500">
          Try {brand.name} risk-free for {brand.trialDurationDays} days. Cancel anytime.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-md rounded-2xl border border-brand-500/20 bg-gradient-to-b from-brand-50 to-white p-8 shadow-lg">
        <div className="text-xs uppercase tracking-wide text-brand-700">Trial</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-5xl font-bold tracking-tight">${brand.trialPrice.toFixed(0)}</span>
          <span className="text-sm text-ink-500">/ {brand.trialDurationDays} days</span>
        </div>
        <p className="mt-2 text-sm text-ink-500">
          Then <strong>${brand.monthlyPrice}/month</strong>. Cancel anytime.
        </p>

        <ul className="mt-6 space-y-3">
          {[
            "Unlimited phone lookups",
            "Unlimited email lookups",
            "Owner name & aliases",
            "Linked social & dating profiles",
            "Data breach exposure",
            "Spam & scam risk score",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              {f}
            </li>
          ))}
        </ul>

        <Link
          href="/signup"
          className="mt-8 block rounded-xl bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Start ${brand.trialPrice.toFixed(0)} trial
        </Link>
        <p className="mt-3 text-center text-xs text-ink-400">
          Secure checkout · Cancel anytime · No hidden fees
        </p>
      </div>
    </section>
  );
}
