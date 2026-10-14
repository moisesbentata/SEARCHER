"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";

type AccountSummary = {
  email: string;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  quota: number;
  used: number;
  hasStripeCustomer: boolean;
};

type LookupRow = {
  id: string;
  kind: "PHONE" | "EMAIL";
  input: string;
  createdAt: string;
};

export function AccountClient({
  account,
  lookups,
}: {
  account: AccountSummary;
  lookups: LookupRow[];
}) {
  const remaining = Math.max(0, account.quota - account.used);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Your account
        </h1>
      </div>

      <div className="mt-2 text-sm text-ink-600">
        Signed in as <span className="font-semibold text-ink-900">{account.email}</span>
      </div>

      <SubscriptionCard account={account} />

      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-ink-900">Usage</h2>
        <div className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">{remaining}</span> of {account.quota}{" "}
          lookups remaining
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-900/5">
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${Math.min(100, (account.used / Math.max(1, account.quota)) * 100)}%` }}
        />
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-ink-900">Recent lookups</h2>
        <Link href="/" className="text-sm font-semibold text-accent-700 hover:underline">
          Run a new lookup →
        </Link>
      </div>

      {lookups.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-ink-900/10 bg-white p-8 text-center text-sm text-ink-500">
          No lookups yet. Head to the homepage to run your first search.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-ink-900/5 overflow-hidden rounded-xl border border-ink-900/5 bg-white">
          {lookups.map((l) => (
            <LookupItem key={l.id} lookup={l} email={account.email} />
          ))}
        </ul>
      )}

      <div className="mt-10 rounded-2xl border border-ink-900/5 bg-ink-900/[0.03] p-5 text-sm text-ink-700">
        Need help? Email{" "}
        <a href={`mailto:${brand.supportEmail}`} className="font-semibold text-accent-700 hover:underline">
          {brand.supportEmail}
        </a>
        . We respond within one business day.
      </div>
    </main>
  );
}

function SubscriptionCard({ account }: { account: AccountSummary }) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  async function openPortal() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const r = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await r.json();
      if (data?.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setPortalError(
        data?.error === "stripe_not_configured"
          ? "Billing isn't live yet — write us at " + brand.supportEmail + " and we'll handle it."
          : "Couldn't open the billing portal. Please try again or email " + brand.supportEmail + ".",
      );
    } catch {
      setPortalError("Network error. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  const status = account.subscriptionStatus;
  const statusLabel = labelForStatus(status);
  const statusTone = toneForStatus(status);

  const nextChargeLabel = account.cancelAtPeriodEnd
    ? "Access ends"
    : status === "TRIALING"
      ? "Trial ends"
      : "Next charge";
  const nextDate = account.currentPeriodEnd ?? account.trialEndsAt;

  return (
    <section className="mt-6 rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-ink-500">
            Subscription
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone}`}
            >
              {statusLabel}
            </span>
            {account.cancelAtPeriodEnd ? (
              <span className="text-xs text-ink-500">· Cancelling at period end</span>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-ink-500">{brand.currencySymbol}{brand.monthlyPrice} / {brand.billingCycleDays} days</div>
        </div>
      </div>

      {nextDate ? (
        <div className="mt-4 text-sm text-ink-700">
          {nextChargeLabel}:{" "}
          <span className="font-semibold text-ink-900">
            {new Date(nextDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {account.hasStripeCustomer ? (
          <button
            type="button"
            onClick={openPortal}
            disabled={portalLoading}
            className="inline-flex items-center justify-center rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
          >
            {portalLoading ? "Opening…" : "Manage billing"}
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
          >
            Start a trial
          </Link>
        )}
        {account.hasStripeCustomer && !account.cancelAtPeriodEnd ? (
          <button
            type="button"
            onClick={openPortal}
            disabled={portalLoading}
            className="inline-flex items-center justify-center rounded-lg border border-ink-900/15 bg-white px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-ink-900/5 disabled:opacity-60"
          >
            Cancel subscription
          </button>
        ) : null}
      </div>
      {portalError ? (
        <div className="mt-3 text-sm text-rose-600">{portalError}</div>
      ) : null}
    </section>
  );
}

function LookupItem({ lookup, email }: { lookup: LookupRow; email: string }) {
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setSending(true);
    setError(null);
    setSentOk(false);
    try {
      const r = await fetch("/api/report/send-pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          subject: lookup.input,
          kind: lookup.kind.toLowerCase(),
        }),
      });
      const data = await r.json();
      if (data?.ok) {
        setSentOk(true);
      } else {
        setError(data?.message ?? "Couldn't send that report. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const kindLabel = lookup.kind === "PHONE" ? "Phone" : "Email";
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-500">
          {kindLabel}
          <span>·</span>
          <span>
            {new Date(lookup.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="mt-0.5 truncate text-sm font-semibold text-ink-900">{lookup.input}</div>
        {sentOk ? (
          <div className="mt-0.5 text-xs text-emerald-700">Report sent to {email}</div>
        ) : error ? (
          <div className="mt-0.5 text-xs text-rose-600">{error}</div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={sending || sentOk}
        className="shrink-0 rounded-lg border border-ink-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-ink-900/5 disabled:opacity-60"
      >
        {sending ? "Sending…" : sentOk ? "Sent" : "Resend PDF"}
      </button>
    </li>
  );
}

function labelForStatus(s: string): string {
  switch (s) {
    case "TRIALING":
      return "Trial active";
    case "ACTIVE":
      return "Active";
    case "PAST_DUE":
      return "Payment past due";
    case "CANCELED":
      return "Cancelled";
    case "NONE":
    default:
      return "No subscription";
  }
}

function toneForStatus(s: string): string {
  switch (s) {
    case "TRIALING":
      return "bg-amber-100 text-amber-800";
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800";
    case "PAST_DUE":
      return "bg-rose-100 text-rose-800";
    case "CANCELED":
      return "bg-ink-900/10 text-ink-700";
    case "NONE":
    default:
      return "bg-ink-900/10 text-ink-700";
  }
}
