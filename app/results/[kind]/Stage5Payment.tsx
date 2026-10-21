"use client";

import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";
import { track } from "@/lib/track";
import { CyclingAvatar } from "@/components/CyclingAvatar";

const STRIPE_ENABLED =
  process.env.NEXT_PUBLIC_STRIPE_ENABLED === "1" ||
  !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function Stage5Payment({
  kind,
  query,
  email,
  onPaid,
}: {
  kind: "phone" | "email";
  query: string;
  email: string;
  onPaid: (method: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Persist the email so the header can show the account pill in place of
  // "Sign in" and so the post-payment OTP gate can pre-fill it.
  useEffect(() => {
    if (!email || typeof window === "undefined") return;
    try {
      window.localStorage.setItem("tc_pending_email", email);
      window.dispatchEvent(new StorageEvent("storage", { key: "tc_pending_email" }));
    } catch {
      /* ignore */
    }
  }, [email]);

  async function pay(method: string) {
    setSelected(method);
    setErrorMsg(null);
    track({
      type: "AddPaymentInfo",
      email,
      value: brand.trialPrice,
      currency: brand.currency,
    });
    track({
      type: "StartTrial",
      email,
      value: brand.trialPrice,
      currency: brand.currency,
    });

    if (STRIPE_ENABLED) {
      try {
        const r = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind, query, email }),
        });
        let data: { ok?: boolean; url?: string; error?: string; message?: string } = {};
        try {
          data = await r.json();
        } catch {
          data = {};
        }
        if (data?.ok && data.url) {
          window.location.href = data.url;
          return;
        }
        const detail = data?.message
          ? `: ${data.message}`
          : data?.error
            ? `: ${data.error}`
            : "";
        setErrorMsg(
          `Payment setup failed (HTTP ${r.status}${detail}). Try again, or email ${brand.supportEmail} if the issue persists.`,
        );
        setSelected(null);
        return;
      } catch {
        setErrorMsg(
          `Network error reaching the payment service. Check your connection and try again.`,
        );
        setSelected(null);
        return;
      }
    }

    // Dormant-Stripe fallback (local dev / Meta-validation phase).
    setTimeout(() => onPaid(method), 900);
  }

  return (
    // pb-40 reserves space below the content so nothing is covered by the
    // fixed bottom CTA (its own height + safe-area padding).
    <section className="min-h-[calc(100vh-4rem)] bg-white pb-40">
      <TopBanner />

      <div className="mx-auto max-w-md px-5 pt-4 sm:px-6 sm:pt-6">
        <ResultsReadyCallout query={query} />

        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-900">
          Your Summary
        </h2>

        <ul className="mt-3 divide-y divide-ink-900/5 rounded-2xl border border-ink-900/5 bg-white">
          <Row
            icon={<IconDoc />}
            label="Owner Report"
            value={`${brand.currencySymbol}${brand.trialPrice.toFixed(2)}`}
          />
          <Row icon={<IconGlobe />} label="Discovered Social Media" value="Included" tone="brand" />
          <Row icon={<IconSearch />} label="20+ Additional Lookups" value="Included" tone="brand" />
        </ul>

        <div className="mt-4 flex items-baseline justify-between border-b border-ink-900/5 pb-4">
          <div className="text-2xl font-extrabold tracking-tight text-ink-900">
            Total Due:
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-ink-900">
            {brand.currencySymbol}
            {brand.trialPrice.toFixed(2)}
          </div>
        </div>

        {errorMsg ? (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
          >
            {errorMsg}
          </div>
        ) : null}

        <div className="mt-16">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-500">
            Details
          </div>
          <div className="mt-3 flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v16H4z" />
                <path d="M8 12h.01M12 12h.01M16 12h.01" />
              </svg>
            </span>
            <div>
              <div className="text-base font-semibold text-ink-900">
                Comprehensive Phone Lookups
              </div>
              <p className="mt-0.5 text-sm text-ink-600">
                Search any phone number to retrieve information about the owner.
                Report for: <strong>{query}</strong>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-600">
            Rest assured, the phone owner will NOT be notified about your
            search.
          </p>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink-500">
          Recurring subscription: you will be charged {brand.currencySymbol}
          {brand.trialPrice.toFixed(2)} today for a{" "}
          {brand.trialDurationDays}-day trial. After the trial ends, your
          subscription renews at {brand.currencySymbol}
          {brand.monthlyPrice} every {brand.billingCycleDays} days unless you
          cancel. You can cancel any time from your account settings.
        </p>
      </div>

      {/* Fixed bottom CTA — persistent across page scroll. Includes a safe
          area inset so the button isn't hidden by iOS gesture bars. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/5 bg-white/95 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-md px-5 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4">
          <CheckoutButton
            busy={!!selected}
            onClick={() => pay("checkout")}
          />
        </div>
      </div>
    </section>
  );
}

function CheckoutButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex h-[76px] w-full flex-col items-center justify-center gap-1 rounded-xl bg-black px-4 shadow-lg transition hover:bg-ink-800 active:translate-y-px disabled:opacity-70 sm:h-[80px]"
    >
      {busy ? (
        <span className="inline-flex items-center gap-2 text-base font-semibold text-white sm:text-lg">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white sm:h-5 sm:w-5" />
          Processing…
        </span>
      ) : (
        <>
          <span className="flex items-center gap-2.5 text-xl font-bold text-white sm:text-2xl">
            <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Unlock Report
          </span>
          <span className="text-[10px] font-medium text-white/60">
            Powered by Stripe
          </span>
        </>
      )}
    </button>
  );
}

function ResultsReadyCallout({ query }: { query: string }) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="relative h-[170px] overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none p-4"
      >
        <div className="flex items-start gap-3 blur-[7px]">
          <CyclingAvatar intervalMs={1400} />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-ink-900/10" />
            <div className="h-3.5 w-1/2 rounded bg-ink-900/10" />
            <div className="mt-1 flex gap-2">
              <span className="inline-block h-4 w-10 rounded-full bg-sky-300/80" />
              <span className="inline-block h-4 w-10 rounded-full bg-emerald-400/80" />
              <span className="inline-block h-4 w-10 rounded-full bg-rose-400/80" />
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2 blur-[7px]">
          <div className="h-2.5 w-full rounded bg-ink-900/10" />
          <div className="h-2.5 w-5/6 rounded bg-ink-900/10" />
        </div>
      </div>
      <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-center shadow-xl">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
          Results Are Ready
        </div>
        <div className="mt-1 truncate text-lg font-extrabold tracking-tight text-ink-900">
          {query}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-500">
          Latest report as of{" "}
          <span className="font-semibold text-brand-700">{date}</span>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "brand";
}) {
  return (
    <li className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700 sm:h-10 sm:w-10">
          {icon}
        </span>
        <span className="text-base font-medium text-ink-900 sm:text-lg">{label}</span>
      </div>
      <span className={`text-base font-semibold sm:text-lg ${tone === "brand" ? "text-brand-700" : "text-ink-900"}`}>
        {value}
      </span>
    </li>
  );
}

function TopBanner() {
  return (
    <div className="border-y border-ink-900/5 bg-white py-1.5 text-center text-sm font-bold text-brand-700 sm:py-3 sm:text-base">
      Download now for {brand.currencySymbol}
      {brand.trialPrice.toFixed(2)}!
    </div>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
