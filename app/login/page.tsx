import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata = { title: `Log in — ${brand.name}` };

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="rounded-2xl border border-ink-900/5 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Log in to see your search history.</p>

        <form className="mt-6 space-y-4">
          <input type="email" placeholder="you@example.com" className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20" />
          <input type="password" placeholder="Password" className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20" />
          <button disabled className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60">
            Log in
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-ink-500">
          New here?{" "}
          <Link href="/signup" className="font-medium text-brand-700 hover:underline">
            Start your trial
          </Link>
        </div>
      </div>
    </section>
  );
}
