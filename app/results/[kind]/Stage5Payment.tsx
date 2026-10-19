"use client";

import { useState } from "react";
import { brand } from "@/lib/brand";
import { track } from "@/lib/track";

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
      // Real payment: redirect to Stripe Checkout. We pass the Stage 3 email
      // so the server can create or reuse an Account without the user having
      // completed OTP login (we don't require login during the paid funnel).
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
        // Surface the error so we can diagnose instead of silently
        // falling back to the simulated flow.
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
      } catch (err) {
        setErrorMsg(
          `Network error reaching the payment service. Check your connection and try again.`,
        );
        setSelected(null);
        return;
      }
    }

    // Dormant-Stripe fallback — only runs when NEXT_PUBLIC_STRIPE_ENABLED is
    // not set (e.g. local dev or Meta-validation phase before Stripe keys).
    setTimeout(() => onPaid(method), 900);
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white pb-10">
      <TopBanner />

      <div className="mx-auto max-w-md px-5 pt-3 sm:px-6 sm:pt-6">
        <h2 className="text-lg font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          Your Summary
        </h2>

        <ul className="mt-2 divide-y divide-ink-900/5 rounded-2xl border border-ink-900/5 bg-white sm:mt-4">
          <Row
            icon={<IconDoc />}
            label="Discovered Data"
            value={`${brand.currencySymbol}${brand.trialPrice.toFixed(2)}`}
          />
          <Row icon={<IconUser />} label="Owner Report" value="Included" tone="brand" />
          <Row icon={<IconGlobe />} label="Discovered Social Media" value="Included" tone="brand" />
          <Row icon={<IconSearch />} label="20+ Additional Lookups" value="Included" tone="brand" />
        </ul>

        <div className="mt-3 flex items-baseline justify-between border-b border-ink-900/5 pb-3 sm:mt-4 sm:pb-4">
          <div className="text-lg font-extrabold tracking-tight text-ink-900 sm:text-2xl">
            Total Due:
          </div>
          <div className="text-lg font-extrabold tracking-tight text-ink-900 sm:text-2xl">
            {brand.currencySymbol}
            {brand.trialPrice.toFixed(2)}
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-ink-500 sm:mt-6 sm:text-xs">
          Choose your payment method
        </div>

        <div className="mt-2 space-y-2 sm:mt-4 sm:space-y-3">
          <PayButton method="paypal" selected={selected} onClick={() => pay("paypal")}>
            <span className="text-lg font-bold italic">
              <span className="text-[#003087]">Pay</span>
              <span className="text-[#0079c1]">Pal</span>
            </span>
          </PayButton>
          <PayButton method="gpay" selected={selected} onClick={() => pay("gpay")}>
            <span className="flex items-center gap-2 text-lg font-semibold text-white">
              <GoogleG />
              Pay
            </span>
          </PayButton>
          <PayButton method="applepay" selected={selected} onClick={() => pay("applepay")}>
            <span className="flex items-center gap-1 text-lg font-semibold text-white">
              Buy with <AppleLogo />
              <span>Pay</span>
            </span>
          </PayButton>
          <PayButton method="card" selected={selected} onClick={() => pay("card")}>
            <span className="flex items-center gap-2 text-lg font-semibold text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="14" rx="3" />
                <path d="M2 11h20" />
              </svg>
              Credit or debit card
            </span>
          </PayButton>
        </div>

        {errorMsg ? (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
          >
            {errorMsg}
          </div>
        ) : null}

        <div className="mt-8">
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
    </section>
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
    <li className="flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-700 sm:h-9 sm:w-9 sm:rounded-lg">
          {icon}
        </span>
        <span className="text-sm font-medium text-ink-900 sm:text-base">{label}</span>
      </div>
      <span className={`text-sm font-semibold sm:text-base ${tone === "brand" ? "text-brand-700" : "text-ink-900"}`}>
        {value}
      </span>
    </li>
  );
}

function PayButton({
  method,
  selected,
  onClick,
  children,
}: {
  method: string;
  selected: string | null;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const busy = selected === method;
  const disabled = selected && !busy;
  const bg =
    method === "paypal"
      ? "bg-[#ffc439]"
      : method === "card"
        ? "bg-accent-600 hover:bg-accent-700"
        : "bg-black hover:bg-ink-800";
  return (
    <button
      onClick={onClick}
      disabled={!!disabled}
      className={`flex h-11 w-full items-center justify-center rounded-xl shadow-sm transition sm:h-14 ${bg} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {busy ? (
        <span className="inline-flex items-center gap-2 text-base font-semibold text-white sm:text-lg">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white sm:h-5 sm:w-5" />
          Processing…
        </span>
      ) : (
        children
      )}
    </button>
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
function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white" aria-hidden>
      <path d="M17.5 12.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.5-4Zm-2.4-7.1c.7-.8 1.1-2 1-3.1-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 3 1.1.1 2.1-.5 2.8-1.3Z" />
    </svg>
  );
}
