"use client";

import { useEffect, useState } from "react";

type Step = {
  label: string;
  detail: string;
  ms: number;
};

const PHONE_STEPS: Step[] = [
  { label: "Parsing number", detail: "Validating format and country code", ms: 550 },
  { label: "Identifying carrier", detail: "Cross-referencing 4B+ number records", ms: 900 },
  { label: "Locating region", detail: "Mapping area code to city and timezone", ms: 800 },
  { label: "Scanning spam databases", detail: "Checking reports from 12M+ users", ms: 1100 },
  { label: "Sweeping public records", detail: "Business filings, WHOIS, court records", ms: 1000 },
  { label: "Checking social platforms", detail: "Facebook, Instagram, Snapchat, WhatsApp, Telegram", ms: 1400 },
  { label: "Compiling report", detail: "Building your full lookup profile", ms: 700 },
];

const EMAIL_STEPS: Step[] = [
  { label: "Parsing email", detail: "Validating address and provider", ms: 500 },
  { label: "Verifying deliverability", detail: "Checking MX records and mailbox status", ms: 900 },
  { label: "Scanning breach databases", detail: "Cross-checking against 12B+ leaked records", ms: 1200 },
  { label: "Locating social profiles", detail: "LinkedIn, Facebook, Instagram, dating apps", ms: 1400 },
  { label: "Checking dating sites", detail: "Tinder, Bumble, Hinge, OkCupid, and 40+ more", ms: 1400 },
  { label: "Sweeping public records", detail: "Domain ownership, business listings, forum activity", ms: 900 },
  { label: "Compiling report", detail: "Building your full lookup profile", ms: 700 },
];

export function SearchAnimation({
  kind,
  query,
  onDone,
}: {
  kind: "phone" | "email";
  query: string;
  onDone: () => void;
}) {
  const steps = kind === "phone" ? PHONE_STEPS : EMAIL_STEPS;
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    function next() {
      if (cancelled) return;
      if (i >= steps.length) {
        setTimeout(onDone, 250);
        return;
      }
      setCurrent(i);
      setTimeout(() => {
        if (cancelled) return;
        setCompleted((c) => [...c, i]);
        i += 1;
        next();
      }, steps[i].ms);
    }
    next();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center">
          <span className="absolute inline-block h-20 w-20 animate-pulse-ring rounded-full bg-brand-500/30" />
          <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
        </div>
        <div className="text-sm uppercase tracking-wider text-ink-400">
          Searching {kind === "phone" ? "phone" : "email"}
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tight break-all">
          {query}
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => {
          const isDone = completed.includes(i);
          const isActive = current === i && !isDone;
          const isPending = i > current;
          return (
            <li
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                isActive
                  ? "border-brand-500/40 bg-brand-50 shadow-sm"
                  : isDone
                    ? "border-ink-900/5 bg-white"
                    : "border-ink-900/5 bg-white opacity-50"
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <svg
                    className="h-5 w-5 text-emerald-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : isActive ? (
                  <span className="block h-5 w-5 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-600" />
                ) : (
                  <span className="block h-5 w-5 rounded-full border-2 border-ink-900/10" />
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm font-semibold ${
                    isPending ? "text-ink-400" : "text-ink-900"
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-xs text-ink-500">{step.detail}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
