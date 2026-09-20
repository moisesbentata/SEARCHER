"use client";

import { useEffect, useState } from "react";
import { SearchAnimation } from "@/components/SearchAnimation";
import { PhoneResults, EmailResults } from "@/components/ResultsCard";
import type { PhoneLookupResult } from "@/lib/phone";
import type { EmailLookupResult } from "@/lib/email";

type PhoneState = { status: "idle" | "loading" | "done" | "error"; data?: PhoneLookupResult };
type EmailState = { status: "idle" | "loading" | "done" | "error"; data?: EmailLookupResult };

export function ResultsClient({
  kind,
  query,
  defaultCountry,
}: {
  kind: "phone" | "email";
  query: string;
  defaultCountry: string;
}) {
  const [animationDone, setAnimationDone] = useState(false);
  const [phone, setPhone] = useState<PhoneState>({ status: "idle" });
  const [email, setEmail] = useState<EmailState>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        if (kind === "phone") {
          setPhone({ status: "loading" });
          const r = await fetch("/api/search/phone", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ phone: query, defaultCountry }),
          });
          const j: PhoneLookupResult = await r.json();
          if (!cancelled) setPhone({ status: "done", data: j });
        } else {
          setEmail({ status: "loading" });
          const r = await fetch("/api/search/email", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: query }),
          });
          const j: EmailLookupResult = await r.json();
          if (!cancelled) setEmail({ status: "done", data: j });
        }
      } catch {
        if (!cancelled) {
          if (kind === "phone") setPhone({ status: "error" });
          else setEmail({ status: "error" });
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [kind, query, defaultCountry]);

  const dataReady =
    kind === "phone" ? phone.status === "done" : email.status === "done";

  if (!animationDone || !dataReady) {
    return (
      <SearchAnimation
        kind={kind}
        query={query}
        onDone={() => setAnimationDone(true)}
      />
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-ink-400">Search complete</div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {kind === "phone" ? "Phone lookup result" : "Email lookup result"}
        </h1>
      </div>
      {kind === "phone" && phone.data ? (
        <PhoneResults result={phone.data} />
      ) : null}
      {kind === "email" && email.data ? (
        <EmailResults result={email.data} />
      ) : null}
    </section>
  );
}
