"use client";

import { useState } from "react";
import Link from "next/link";
import { rememberEmail, track } from "@/lib/track";
import { logStage } from "@/lib/funnel";

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
    // Seed Meta advanced matching with the hashed email before the Lead
    // event fires so even the first conversion picks up the stronger
    // match signal.
    void rememberEmail(email);
    track({ type: "Lead", email });
    logStage("LEAD_SUBMIT", { email });
    // Persist for the header pill + post-payment OTP gate.
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("tc_pending_email", email);
        window.dispatchEvent(new StorageEvent("storage", { key: "tc_pending_email" }));
      } catch {
        /* ignore */
      }
    }
    onContinue(email);
  }

  return (
    <section className="mx-auto min-h-[75vh] max-w-md px-5 py-8 sm:px-6">
      {/* Blurred dashboard-style preview behind a floating modal */}
      <div className="relative">
        <div
          className="pointer-events-none select-none rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm"
          style={{ filter: "blur(6px)" }}
          aria-hidden
        >
          <BlurredDashboard />
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

      <h1 className="mt-6 whitespace-nowrap text-center text-[1.15rem] font-extrabold tracking-tight text-ink-900 sm:text-2xl">
        Where should we send your report?
      </h1>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="block rounded-xl bg-ink-900/[0.04] px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-500">
            Email
          </span>
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full bg-transparent text-base font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none"
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

// A fake behind-the-scenes profile dashboard: avatar+name header, a strip of
// account chips (dating/social/breach), a couple of address rows, and chat
// bubbles. Rendered with real-ish shapes and words so that when blurred it
// reads as a rich dashboard rather than random gray blocks.
function BlurredDashboard() {
  return (
    <div className="space-y-3">
      {/* Profile header */}
      <div className="flex items-center gap-3">
        <NoProfileAvatar />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-40 rounded bg-ink-900/70" />
          <div className="mt-1.5 h-3 w-28 rounded bg-ink-900/25" />
          <div className="mt-2 flex gap-1.5">
            <span className="h-4 w-14 rounded-full bg-brand-500/70" />
            <span className="h-4 w-10 rounded-full bg-emerald-500/60" />
            <span className="h-4 w-12 rounded-full bg-rose-500/50" />
          </div>
        </div>
      </div>

      {/* Data rows: Email / Phone / Address */}
      <div className="space-y-2 rounded-xl bg-ink-900/[0.04] p-3">
        <DataRow labelWidth="w-14" valueWidth="w-40" />
        <DataRow labelWidth="w-16" valueWidth="w-32" />
        <DataRow labelWidth="w-20" valueWidth="w-44" />
      </div>

      {/* Linked accounts grid — compact row, half the chips of the old block */}
      <div>
        <div className="mb-2 h-3 w-32 rounded bg-ink-900/50" />
        <div className="grid grid-cols-4 gap-2">
          <AccountChip color="bg-pink-500/70" />
          <AccountChip color="bg-blue-600/70" />
          <AccountChip color="bg-sky-500/70" />
          <AccountChip color="bg-red-500/70" />
        </div>
      </div>
    </div>
  );
}

// Generic "no profile picture" placeholder: gray circle with the default
// person silhouette (head + shoulders), rendered chunky/pixelated so it reads
// as the empty-avatar default you see on social networks when a user hasn't
// uploaded a photo.
function NoProfileAvatar() {
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-ink-900/[0.12] ring-1 ring-ink-900/10">
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full"
        style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
        aria-hidden
      >
        {/* Head — chunky rectangles so it reads as pixelated */}
        <rect x="24" y="14" width="16" height="4" fill="#8a95a5" />
        <rect x="22" y="18" width="20" height="4" fill="#8a95a5" />
        <rect x="20" y="22" width="24" height="8" fill="#8a95a5" />
        <rect x="22" y="30" width="20" height="4" fill="#8a95a5" />
        {/* Shoulders / body */}
        <rect x="14" y="42" width="36" height="6" fill="#8a95a5" />
        <rect x="10" y="48" width="44" height="16" fill="#8a95a5" />
      </svg>
    </div>
  );
}

function DataRow({ labelWidth, valueWidth }: { labelWidth: string; valueWidth: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className={`h-3 rounded bg-ink-900/30 ${labelWidth}`} />
      <div className={`h-3 rounded bg-ink-900/70 ${valueWidth}`} />
    </div>
  );
}

function AccountChip({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-white/60 p-1.5 ring-1 ring-ink-900/5">
      <span className={`h-4 w-4 rounded-md ${color}`} />
      <span className="h-2 flex-1 rounded bg-ink-900/40" />
    </div>
  );
}

