"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Stage1PhoneMap } from "./Stage1PhoneMap";
import { Stage2OwnerInfo } from "./Stage2OwnerInfo";
import { Stage3EmailCapture } from "./Stage3EmailCapture";
import { Stage5Payment } from "./Stage5Payment";
import { Stage6Report } from "./Stage6Report";
import type { PhoneLookupResult } from "@/lib/phone";
import type { EmailLookupResult } from "@/lib/email";
import { rememberEmail, track } from "@/lib/track";
import { brand } from "@/lib/brand";
import { LoginDialog } from "@/components/LoginDialog";

type Stage =
  | "phoneMap" // stage 1, phone only
  | "owner" // stage 2
  | "emailCapture" // stage 3
  | "payment" // combined paywall + summary (formerly stages 4 + 5)
  | "success"; // stage 6

export function ResultsClient({
  kind,
  query,
  defaultCountry,
}: {
  kind: "phone" | "email";
  query: string;
  defaultCountry: string;
}) {
  const search = useSearchParams();
  const paid = search?.get("paid") === "1";
  const sessionId = search?.get("session_id") ?? "";
  const initialStage: Stage = paid
    ? "success"
    : kind === "phone"
      ? "phoneMap"
      : "owner";
  const [stage, setStage] = useState<Stage>(initialStage);
  const [phone, setPhone] = useState<PhoneLookupResult | null>(null);
  const [email, setEmail] = useState<EmailLookupResult | null>(null);
  const [captured, setCaptured] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem("tc_pending_email") ?? "";
    } catch {
      return "";
    }
  });

  // Seed Meta advanced matching the moment we know the viewer's email —
  // from localStorage on mount, from the session detection below, or from
  // the OTP dialog after post-payment verify. The hash + re-init in
  // rememberEmail guards against double-work.
  useEffect(() => {
    if (captured) void rememberEmail(captured);
  }, [captured]);

  // Post-payment session gate: once we're in the success stage, confirm the
  // user has a real logged-in session. If not, we open the OTP dialog
  // pre-filled with the captured email and block the report until they
  // verify. Keeps Stage 6 behind an email-ownership check without adding
  // friction during the paid funnel itself.
  const [needsVerify, setNeedsVerify] = useState(false);
  const [verifyChecked, setVerifyChecked] = useState(false);

  // Already-subscribed detection. If a logged-in user with an active or
  // trialing subscription arrives via a fresh lookup, we skip the email
  // capture and the paywall and drop them straight into Stage 6 — paying
  // customers should never re-pay.
  const [isPaidUser, setIsPaidUser] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (cancelled || !res.ok) return;
        const body = await res.json().catch(() => ({}));
        const status: string | undefined = body?.account?.subscriptionStatus;
        if (status === "TRIALING" || status === "ACTIVE") {
          setIsPaidUser(true);
          if (body?.account?.email) setCaptured(body.account.email);
          // If we're already past the drama stages and about to hit a
          // paywall, jump straight to success instead.
          setStage((s) =>
            s === "emailCapture" || s === "payment" ? "success" : s,
          );
        }
      } catch {
        /* best effort — fall back to normal paid-funnel */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Jump to the top of the viewport whenever we transition between stages
  // so a long previous page doesn't leave the next one scrolled mid-way.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage]);

  useEffect(() => {
    if (stage !== "success") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          setNeedsVerify(true);
        } else {
          const body = await res.json().catch(() => ({}));
          setNeedsVerify(!body?.account);
        }
      } finally {
        if (!cancelled) setVerifyChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stage]);

  // Fire the Purchase event once we reach the success stage. Uses the
  // Stripe checkout session id as event_id so the server-side Purchase
  // CAPI event fired from the Stripe webhook dedupes against this one in
  // Meta — Meta merges two events with the same event_id regardless of
  // which leg wins the race.
  useEffect(() => {
    if (stage !== "success") return;
    track({
      type: "Purchase",
      email: captured,
      value: brand.trialPrice,
      currency: brand.currency,
      transaction_id: sessionId || undefined,
      event_id: sessionId || undefined,
    });
  }, [stage, captured, sessionId]);

  // Fire the real backend lookup up-front so results are ready when the
  // animation naturally lands.
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (kind === "phone") {
        const r = await fetch("/api/search/phone", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ phone: query, defaultCountry }),
        });
        if (!cancelled) setPhone(await r.json());
      } else {
        const r = await fetch("/api/search/email", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: query }),
        });
        if (!cancelled) setEmail(await r.json());
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [kind, query, defaultCountry]);

  // Wait for the phone data before starting stage 1
  if (kind === "phone" && !phone) {
    return <FullPageSpinner />;
  }
  if (kind === "email" && !email) {
    return <FullPageSpinner />;
  }

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {stage === "phoneMap" && phone ? (
        <Stage1PhoneMap result={phone} onDone={() => setStage("owner")} />
      ) : null}

      {stage === "owner" ? (
        <Stage2OwnerInfo
          kind={kind}
          query={query}
          onDone={() => setStage(isPaidUser ? "success" : "emailCapture")}
        />
      ) : null}

      {stage === "emailCapture" ? (
        <Stage3EmailCapture
          query={query}
          displayDate={today}
          onContinue={(e) => {
            setCaptured(e);
            setStage("payment");
          }}
        />
      ) : null}

      {stage === "payment" ? (
        <Stage5Payment
          kind={kind}
          query={query}
          email={captured}
          onPaid={() => setStage("success")}
        />
      ) : null}

      {stage === "success" && verifyChecked && !needsVerify ? (
        kind === "phone" && phone ? (
          <Stage6Report kind="phone" query={query} phone={phone} email={null} />
        ) : email ? (
          <Stage6Report kind="email" query={query} phone={null} email={email} />
        ) : null
      ) : null}

      {stage === "success" && verifyChecked && needsVerify ? (
        <>
          <div className="min-h-[calc(100vh-4rem)] bg-white">
            <div className="mx-auto max-w-md px-5 pt-16 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                One last step
              </h2>
              <p className="mt-2 text-sm text-ink-600">
                Verify the email on your account to unlock your report.
              </p>
            </div>
          </div>
          <LoginDialog
            open
            onClose={() => {
              /* non-dismissible */
            }}
            initialEmail={captured || undefined}
            autoSend={!!captured}
            dismissible={false}
            onSuccess={() => setNeedsVerify(false)}
          />
        </>
      ) : null}

      {/* ============================================================ *
       * DEV SHORTCUT — DELETE BEFORE LAUNCH
       * ============================================================ *
       * Floating fuchsia pill at bottom-right. Jumps straight past the
       * loading/scanning stages to Stage 3 ("Your results are ready").
       * No env gate — ship-blocker is the giant banner above. Grep for
       * "DEV SHORTCUT" to find and nuke.
       * ============================================================ */}
      {stage !== "emailCapture" &&
      stage !== "payment" &&
      stage !== "success" ? (
        <button
          type="button"
          onClick={() => setStage("emailCapture")}
          className="fixed bottom-5 right-5 z-50 rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-xl ring-2 ring-white hover:bg-fuchsia-500"
          title="DEV ONLY — jump to Results Ready page"
        >
          ⚡ Skip to results ready
        </button>
      ) : null}
    </>
  );
}

function FullPageSpinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-600/25 border-t-brand-600" />
    </div>
  );
}
