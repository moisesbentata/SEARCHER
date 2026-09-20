"use client";

import { useState } from "react";
import Link from "next/link";
import { CyclingAvatar } from "@/components/CyclingAvatar";
import { brand } from "@/lib/brand";

export function Stage4Paywall({
  query,
  email,
  onContinue,
}: {
  query: string;
  email: string;
  onContinue: () => void;
}) {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white pb-24">
      <SmallAccountBar email={email} />
      <TopBanner />

      <div className="mx-auto max-w-md px-5 pt-6 sm:px-6">
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-ink-900">
          Your Report is Ready!
        </h1>

        <div className="mt-5 overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-sm">
          {/* Blurred owner preview */}
          <div className="pointer-events-none relative select-none p-5">
            <div className="flex items-start gap-4 blur-[6px]">
              <CyclingAvatar intervalMs={1400} />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-2/3 rounded bg-ink-900/10" />
                <div className="h-3 w-1/2 rounded bg-ink-900/10" />
                <span className="inline-block h-5 w-24 rounded-full bg-brand-200" />
              </div>
            </div>
            <div className="mt-5 space-y-2 blur-[6px]">
              <div className="h-3 w-full rounded bg-ink-900/10" />
              <div className="h-3 w-5/6 rounded bg-ink-900/10" />
              <div className="h-3 w-3/4 rounded bg-ink-900/10" />
              <div className="h-3 w-4/6 rounded bg-ink-900/10" />
            </div>
          </div>
          <div className="border-t border-ink-900/5 bg-ink-900/[0.03] px-5 py-3 text-center text-sm text-ink-700">
            Report for: <span className="font-bold text-ink-900">{query}</span>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-accent-600 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-accent-700 active:translate-y-px"
        >
          Get My Report
        </button>

        <SocialProofCard />

        <ul className="mt-6 space-y-3">
          <Check text="Search any phone number to retrieve information about the owner" />
          <Check text="The phone owner will NOT be notified about your search" />
          <Check text="The report may contain surprising information. Please be prepared for unexpected results." />
          <Check>
            <span>
              Get a{" "}
              <strong>
                {brand.trialDurationDays}-day trial for just {brand.currencySymbol}
                {brand.trialPrice.toFixed(2)}
              </strong>
              . After trial,{" "}
              <strong>
                we&apos;ll charge {brand.currencySymbol}
                {brand.monthlyPrice} every {brand.billingCycleDays} days until you cancel
              </strong>
              .
            </span>
          </Check>
        </ul>

        <PressStrip />
        <TrustpilotCard />
        <FaqAccordion />

        <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-50 p-5 text-sm text-brand-900">
          <div className="font-semibold">Cancel anytime</div>
          <p className="mt-1 text-brand-800">
            One click from your account settings — no phone call, no email
            required.
          </p>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-900/5 bg-white p-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-md">
          <button
            onClick={onContinue}
            className="w-full rounded-xl bg-accent-600 py-4 text-lg font-semibold text-white shadow-sm hover:bg-accent-700"
          >
            Get My Report
          </button>
        </div>
      </div>
    </section>
  );
}

function TopBanner() {
  return (
    <div className="border-y border-ink-900/5 bg-white py-3 text-center text-base font-bold text-brand-700">
      Download now for {brand.currencySymbol}
      {brand.trialPrice.toFixed(2)}!
    </div>
  );
}

function SmallAccountBar({ email }: { email: string }) {
  const initial = (email[0] ?? "U").toUpperCase();
  const label = email.length > 18 ? email.slice(0, 15) + "…" : email;
  return (
    <div className="border-b border-ink-900/5 bg-ink-900/[0.03]">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-5 py-2 text-xs">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white px-2 py-1">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-900/[0.06] text-[10px] font-bold text-ink-800">
            {initial}
          </span>
          <span className="text-ink-700">{label}</span>
        </span>
      </div>
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

function SocialProofCard() {
  const initials = ["T.J", "A.K", "R.S", "M.E", "J.D"];
  return (
    <div className="mt-5 flex items-center justify-between rounded-xl border border-ink-900/5 bg-white px-4 py-3 shadow-sm">
      <div className="text-sm font-semibold leading-tight text-ink-800">
        Over 9,127 phone numbers
        <br />
        looked up today
      </div>
      <div className="flex -space-x-2">
        {initials.map((n, i) => (
          <span
            key={n}
            className="grid h-8 w-8 place-items-center rounded-full bg-ink-900/[0.06] text-[10px] font-bold text-ink-700 ring-2 ring-white"
            style={{ zIndex: 10 - i }}
          >
            {n}
          </span>
        ))}
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900/[0.06] text-[10px] font-bold text-ink-700 ring-2 ring-white">
          +9.1k
        </span>
      </div>
    </div>
  );
}

function PressStrip() {
  return (
    <div className="mt-8 border-y border-ink-900/5 py-5">
      <div className="flex flex-wrap items-center justify-around gap-x-6 gap-y-3 text-lg font-black uppercase tracking-wider text-ink-400">
        <span className="italic">Entrepreneur</span>
        <span className="rounded bg-ink-900/[0.06] px-2 py-0.5 tracking-[0.35em]">WIRED</span>
        <span>msn</span>
        <span className="tracking-[0.15em]">BBC</span>
      </div>
      <div className="mt-4 text-center text-2xl font-serif tracking-wider text-ink-400">
        THE GLOBE AND MAIL
      </div>
    </div>
  );
}

function TrustpilotCard() {
  return (
    <div className="mt-6">
      <div className="rounded-xl border border-ink-900/5 bg-white p-4 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="grid h-6 w-6 place-items-center rounded-sm bg-emerald-500 text-white">★</span>
          ))}
          <span className="grid h-6 w-6 place-items-center rounded-sm bg-ink-900/10 text-white">★</span>
        </div>
        <div className="mt-3 text-lg font-extrabold text-ink-900">Great, delivered as promised</div>
        <p className="mt-1 line-clamp-3 text-sm text-ink-600">
          Fast, accurate, and worth the price. Found the owner of an unknown number that had been calling my partner. Cancel was quick.
        </p>
        <div className="mt-3 text-xs text-ink-500">
          <span className="font-semibold">M Murphy</span>, 3 days ago
        </div>
      </div>
      <div className="mt-3 text-center text-sm text-ink-500">
        Rated <strong>3.8</strong> / 5 · <span className="underline">44,562 reviews</span>
      </div>
      <div className="mt-1 flex items-center justify-center gap-2 text-sm text-ink-700">
        <span className="text-emerald-500">★</span>
        <span className="font-semibold">Trustpilot</span>
      </div>
    </div>
  );
}

function FaqAccordion() {
  const items = [
    {
      q: "Is it free to use?",
      a: `${brand.name} offers a ${brand.trialDurationDays}-day trial for ${brand.currencySymbol}${brand.trialPrice.toFixed(2)}. After the trial the subscription renews at ${brand.currencySymbol}${brand.monthlyPrice} every ${brand.billingCycleDays} days. Cancel any time.`,
    },
    {
      q: "How do I cancel my subscription?",
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
