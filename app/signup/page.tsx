import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata = { title: `Sign up — ${brand.name}` };

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="rounded-2xl border border-ink-900/5 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight">Start your trial</h1>
        <p className="mt-1 text-sm text-ink-500">
          ${brand.trialPrice.toFixed(0)} for {brand.trialDurationDays} days, then ${brand.monthlyPrice}/month.
        </p>

        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Email
            </span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Password
            </span>
            <input
              type="password"
              required
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
            />
          </label>

          <button
            type="submit"
            disabled
            title="Payment integration coming next"
            className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            Continue to payment
          </button>

          <p className="text-center text-xs text-ink-400">
            Payment integration ships next. This is the entry point.
          </p>
        </form>

        <div className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
