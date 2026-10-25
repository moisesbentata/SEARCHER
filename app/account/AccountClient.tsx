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

export function AccountClient({ account }: { account: AccountSummary }) {
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

      <div className="mt-6">
        <Link href="/" className="text-sm font-semibold text-accent-700 hover:underline">
          Run a new lookup →
        </Link>
      </div>

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
