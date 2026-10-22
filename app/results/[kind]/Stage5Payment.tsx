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
    // Fire the three paywall-moment events on the single CTA click so Meta
    // has a clean funnel: InitiateCheckout → AddPaymentInfo → StartTrial.
    track({
      type: "InitiateCheckout",
      email,
      value: brand.trialPrice,
      currency: brand.currency,
    });
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

    setTimeout(() => onPaid(method), 900);
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white pb-40">
      <TopBanner />

      <div className="mx-auto max-w-md px-5 pt-4 sm:px-6 sm:pt-6">
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-ink-900">
          Your Report is Ready!
        </h1>

        <div className="mt-4">
          <ResultsReadyCallout query={query} />
        </div>

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

        {/* === Below-the-fold marketing: trust, checks, FAQ === */}
        <div className="mt-8">
          <LiveLookupPill />
          <div className="mt-2">
            <TrustpilotCard />
          </div>

          <ul className="mt-6 space-y-3">
            <Check text="Search any phone number to retrieve information about the owner" />
            <Check text="The phone owner will NOT be notified about your search" />
            <Check text="The report may contain surprising information. Please be prepared for unexpected results." />
            <Check>
              <span>
                Get a {brand.trialDurationDays}-day trial for just {brand.currencySymbol}
                {brand.trialPrice.toFixed(2)}. After trial, we&apos;ll charge{" "}
                {brand.currencySymbol}
                {brand.monthlyPrice} every {brand.billingCycleDays} days until
                you cancel.
              </span>
            </Check>
          </ul>

          <FaqAccordion />

          <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-50 p-5 text-sm text-brand-900">
            <div className="font-semibold">Cancel anytime</div>
            <p className="mt-1 text-brand-800">
              One click from your account settings — no phone call, no email
              required.
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
      </div>

      {/* Fixed bottom CTA — persistent across page scroll. */}
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
      className="relative flex h-[76px] w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-xl bg-black px-4 shadow-lg transition hover:bg-ink-800 active:translate-y-px disabled:opacity-70 sm:h-[80px]"
    >
      {/* Subtle shimmer sweep — periodic nudge to catch the eye without
          being distracting. Hidden during Processing. */}
      {!busy ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-cta-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
      ) : null}

      {busy ? (
        <span className="relative inline-flex items-center gap-2 text-base font-semibold text-white sm:text-lg">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white sm:h-5 sm:w-5" />
          Processing…
        </span>
      ) : (
        <>
          <span className="relative flex items-center gap-2.5 text-xl font-bold text-white sm:text-2xl">
            Unlock Report
            <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
          <span className="relative flex items-center gap-1 text-[10px] font-medium text-white/60">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
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
      {/* Blurred profile mockup behind the "Results Are Ready" callout: a
          dark avatar top-left, colored dating-app pills bottom-centre, and
          an Instagram-looking gradient tile bottom-right. Reads as a rich
          profile dashboard being hidden rather than empty space. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none"
      >
        {/* Avatar + name hint, top-left */}
        <div className="absolute left-4 top-3 flex items-start gap-2.5 blur-[7px]">
          <span className="block h-10 w-10 rounded-full bg-gradient-to-br from-ink-900 to-ink-700" />
          <span className="mt-1.5 inline-block h-3 w-24 rounded bg-ink-900/40" />
        </div>

        {/* Colored dating-app / social pills, bottom-centre */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 blur-[8px]">
          <span className="inline-block h-5 w-12 rounded-full bg-sky-400/80" />
          <span className="inline-block h-5 w-12 rounded-full bg-emerald-500/80" />
          <span className="inline-block h-5 w-12 rounded-full bg-rose-500/80" />
        </div>

        {/* Instagram-style app-icon tile, bottom-right. Reduced blur so the
            square-outline + circle-lens + flash-dot combo survives and the
            icon reads as Instagram instead of a generic pink blob. */}
        <div className="absolute bottom-3 right-4 blur-[3.5px]">
          <span
            className="relative block h-10 w-10 rounded-[11px] shadow-md"
            style={{
              background:
                "linear-gradient(45deg, #fdb94e 0%, #ee596e 35%, #c13584 65%, #833ab4 100%)",
            }}
          >
            {/* Camera body — rounded square outline */}
            <span className="absolute inset-[18%] rounded-[6px] border-[2.5px] border-white" />
            {/* Lens — circle in the middle */}
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white" />
            {/* Flash — tiny dot top-right */}
            <span className="absolute right-[22%] top-[22%] h-[3px] w-[3px] rounded-full bg-white" />
          </span>
        </div>
      </div>

      {/* Centered Results Are Ready card */}
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

function Check({
  text,
  children,
}: {
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-100">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span className="text-[15px] leading-snug text-ink-800">
        {children ?? text}
      </span>
    </li>
  );
}

function LiveLookupPill() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-ink-500">
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      441+ lookups today
    </div>
  );
}

function TrustpilotCard() {
  return (
    <div className="mt-6">
      <div className="rounded-xl border border-ink-900/5 bg-white p-4 shadow-sm">
        <TrustpilotStars value={4.5} />
        <div className="mt-3 text-lg font-extrabold text-ink-900">Great, delivered as promised</div>
        <p className="mt-1 line-clamp-3 text-sm text-ink-600">
          Fast, accurate, and worth the price. Found the owner of an unknown number that had been calling my partner. Cancel was quick.
        </p>
        <div className="mt-3 text-xs text-ink-500">
          <span className="font-semibold">M Murphy</span>, 3 days ago
        </div>
      </div>
      <div className="mt-3 text-center text-sm text-ink-500">
        Rated <strong>4.5</strong> / 5 · <span className="underline">22,514 reviews</span>
      </div>
      <div className="mt-1 flex items-center justify-center gap-2 text-sm text-ink-700">
        <span className="text-emerald-500">★</span>
        <span className="font-semibold">Trustpilot</span>
      </div>
    </div>
  );
}

function TrustpilotStars({ value }: { value: number }) {
  const cells: ("full" | "half" | "empty")[] = [];
  for (let i = 0; i < 5; i++) {
    if (value >= i + 1) cells.push("full");
    else if (value >= i + 0.5) cells.push("half");
    else cells.push("empty");
  }
  return (
    <div className="flex gap-1">
      {cells.map((state, i) => (
        <span
          key={i}
          className="relative grid h-6 w-6 place-items-center overflow-hidden rounded-sm bg-ink-900/10 text-white"
        >
          {state !== "empty" ? (
            <span
              className="absolute inset-y-0 left-0 bg-emerald-500"
              style={{ width: state === "full" ? "100%" : "50%" }}
            />
          ) : null}
          <span className="relative">★</span>
        </span>
      ))}
    </div>
  );
}

function FaqAccordion() {
  const items = [
    {
      q: "Is it free to use?",
      a: `${brand.name} offers a ${brand.trialDurationDays}-day trial for ${brand.currencySymbol}${brand.trialPrice.toFixed(2)}. After the trial the membership renews at ${brand.currencySymbol}${brand.monthlyPrice} every ${brand.billingCycleDays} days. Cancel any time.`,
    },
    {
      q: "How do I cancel my membership?",
      a: `Log in and open your Account Settings — one click cancels. You can also email ${brand.supportEmail} and we'll cancel within 24 hours.`,
    },
    {
      q: "What are acceptable uses? (And what's not allowed?)",
      a: `${brand.name} is for personal informational use. It is NOT a consumer reporting agency. Do not use it for decisions covered by the FCRA — employment, credit, housing, insurance, or benefits eligibility.`,
    },
    {
      q: "What can I find with a reverse phone lookup?",
      a: "Owner name, addresses on record, linked emails and phones, social and dating profiles, and spam or scam reports — depending on what public data is available.",
    },
    {
      q: "How accurate is the information provided by a reverse phone lookup?",
      a: "Number metadata (country, carrier, region) is highly accurate. Owner information is best-effort based on public and open-web data and may be incomplete or outdated.",
    },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-8 rounded-2xl bg-ink-900/[0.03] p-5">
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-ink-900">FAQ</h2>
      <div className="mt-4 divide-y divide-ink-900/5">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <button
              key={item.q}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <div>
                <div className="text-base font-semibold text-ink-900">{item.q}</div>
                {isOpen ? (
                  <p className="mt-1 text-sm text-ink-600">{item.a}</p>
                ) : null}
              </div>
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 shrink-0 text-ink-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          );
        })}
      </div>
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
