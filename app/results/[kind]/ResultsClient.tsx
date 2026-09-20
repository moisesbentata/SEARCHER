"use client";

import { useEffect, useState } from "react";
import { Stage1PhoneMap } from "./Stage1PhoneMap";
import { Stage2OwnerInfo } from "./Stage2OwnerInfo";
import { Stage3EmailCapture } from "./Stage3EmailCapture";
import { Stage4Paywall } from "./Stage4Paywall";
import { Stage5Payment } from "./Stage5Payment";
import { Stage6Success } from "./Stage6Success";
import type { PhoneLookupResult } from "@/lib/phone";
import type { EmailLookupResult } from "@/lib/email";

type Stage =
  | "phoneMap" // stage 1, phone only
  | "owner" // stage 2
  | "emailCapture" // stage 3
  | "paywall" // stage 4
  | "payment" // stage 5
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
  const initialStage: Stage = kind === "phone" ? "phoneMap" : "owner";
  const [stage, setStage] = useState<Stage>(initialStage);
  const [phone, setPhone] = useState<PhoneLookupResult | null>(null);
  const [email, setEmail] = useState<EmailLookupResult | null>(null);
  const [captured, setCaptured] = useState<string>("");

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
          onDone={() => setStage("emailCapture")}
        />
      ) : null}

      {stage === "emailCapture" ? (
        <Stage3EmailCapture
          query={query}
          displayDate={today}
          onContinue={(e) => {
            setCaptured(e);
            setStage("paywall");
          }}
        />
      ) : null}

      {stage === "paywall" ? (
        <Stage4Paywall
          query={query}
          email={captured}
          onContinue={() => setStage("payment")}
        />
      ) : null}

      {stage === "payment" ? (
        <Stage5Payment
          query={query}
          email={captured}
          onPaid={() => setStage("success")}
        />
      ) : null}

      {stage === "success" ? (
        kind === "phone" && phone ? (
          <Stage6Success kind="phone" query={query} phone={phone} email={null} />
        ) : email ? (
          <Stage6Success kind="email" query={query} phone={null} email={email} />
        ) : null
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
