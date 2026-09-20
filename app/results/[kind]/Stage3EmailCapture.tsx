"use client";

import { useState } from "react";
import Link from "next/link";
import { CyclingAvatar } from "@/components/CyclingAvatar";

export function Stage3EmailCapture({
  query,
  displayDate,
  onContinue,
}: {
  query: string;
  displayDate: string;
  onContinue: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);

  const canContinue = /.+@.+\..+/.test(email) && accepted;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    onContinue(email);
  }

  return (
    <section className="mx-auto max-w-md px-5 py-8 sm:px-6">
      {/* Blurred report tease behind a floating modal */}
      <div className="relative">
        <div className="pointer-events-none select-none rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm blur-sm">
          <div className="flex items-center gap-3">
            <CyclingAvatar intervalMs={1200} />
            <div className="flex-1">
              <div className="h-4 w-3/4 rounded bg-ink-900/10" />
              <div className="mt-2 h-3 w-1/2 rounded bg-ink-900/10" />
              <div className="mt-3 h-2 w-full rounded bg-ink-900/10" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded bg-ink-900/10" />
            <div className="h-3 w-1/2 rounded bg-ink-900/10" />
            <div className="h-3 w-3/4 rounded bg-ink-900/10" />
          </div>
        </div>

        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-ink-900/5">
          <div className="text-center text-xs font-bold uppercase tracking-widest text-ink-500">
            Results are ready
          </div>
          <div className="mt-2 truncate text-center text-2xl font-extrabold tracking-tight text-ink-900">
            {query}
          </div>
          <div className="mt-1 text-center text-sm text-ink-500">
            Latest report as of{" "}
            <span className="font-semibold text-brand-700">{displayDate}</span>
          </div>
        </div>
      </div>

      <h1 className="mt-8 text-center text-2xl font-extrabold tracking-tight text-ink-900">
        Where should we send your report?
      </h1>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="block">
          <span className="pointer-events-none block px-4 pt-3 text-xs font-medium text-ink-500">
            Email
          </span>
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="-mt-1 block w-full rounded-xl bg-ink-900/[0.04] px-4 pb-3 text-lg font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>

        <label className="flex items-start gap-3 pt-1 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-ink-900/20 text-accent-600 focus:ring-accent-500"
          />
          <span>
            I accept the{" "}
            <Link href="/terms-conditions" className="font-semibold text-accent-700 hover:underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent-700 hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={!canContinue}
          className="mt-1 w-full rounded-xl bg-accent-600 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-60"
        >
          Continue
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-ink-400">
        <span className="h-px flex-1 bg-ink-900/10" />
        <span>Or continue with</span>
        <span className="h-px flex-1 bg-ink-900/10" />
      </div>

      <button
        type="button"
        onClick={() => canContinue || setAccepted(true)}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-ink-900/10 bg-white py-3.5 text-base font-semibold text-ink-800 shadow-sm hover:bg-ink-900/[0.02]"
      >
        <GoogleG />
        Sign in with Google
      </button>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-500/20 bg-brand-50 p-4 text-sm text-ink-700">
        <svg className="mt-0.5 h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <div>
          <strong className="block font-semibold text-ink-900">
            Before you view the results…
          </strong>
          This report may include information about the owner&apos;s identity and history.
        </div>
      </div>
    </section>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
