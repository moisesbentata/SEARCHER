"use client";

import { useEffect, useState } from "react";
import { WorldMapBg } from "@/components/WorldMapBg";
import { CountdownBar } from "@/components/StripedProgressBar";
import type { PhoneLookupResult } from "@/lib/phone";

type Row =
  | { key: "carrier"; label: "Carrier"; value?: string }
  | { key: "type"; label: "Type"; value?: string }
  | { key: "country"; label: "Country"; value?: string }
  | { key: "city"; label: "City"; value?: string; blurred?: boolean }
  | { key: "location"; label: "Location"; defined?: boolean };

type Phase = {
  title: string;
  seconds: number;
  totalMs: number;
  reveal: Record<string, boolean>; // which row keys are revealed by end
};

const PHASES: Phase[] = [
  { title: "Initiating phone lookup", seconds: 8, totalMs: 2200, reveal: {} },
  {
    title: "Analyzing phone data",
    seconds: 3,
    totalMs: 2500,
    reveal: { carrier: true, type: true, country: true, city: true },
  },
  {
    title: "Mapping location",
    seconds: 0,
    totalMs: 1500,
    reveal: { carrier: true, type: true, country: true, city: true, location: true },
  },
];

export function Stage1PhoneMap({
  result,
  onDone,
}: {
  result: PhoneLookupResult;
  onDone: () => void;
}) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [seconds, setSeconds] = useState(PHASES[0].seconds);

  useEffect(() => {
    let cancelled = false;
    let phase = 0;

    function runPhase() {
      if (cancelled) return;
      if (phase >= PHASES.length) {
        setTimeout(() => !cancelled && onDone(), 500);
        return;
      }
      setPhaseIdx(phase);
      const p = PHASES[phase];
      setSeconds(p.seconds);
      const tickMs = 200;
      const totalTicks = Math.max(1, Math.floor(p.totalMs / tickMs));
      let t = 0;
      const timer = setInterval(() => {
        if (cancelled) {
          clearInterval(timer);
          return;
        }
        t += 1;
        const remaining = Math.max(0, Math.round((p.seconds * (totalTicks - t)) / totalTicks));
        setSeconds(remaining);
        if (t >= totalTicks) {
          clearInterval(timer);
          phase += 1;
          runPhase();
        }
      }, tickMs);
    }

    runPhase();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPhase = PHASES[phaseIdx];
  const reveal = currentPhase.reveal;

  const carrier =
    result.type === "MOBILE"
      ? sampleCarrier(result.countryCode)
      : result.type === "VOIP"
        ? "VoIP provider"
        : result.type === "TOLL_FREE"
          ? "Toll-free"
          : "Landline";

  const typeLabel = (() => {
    switch (result.type) {
      case "MOBILE":
        return "Mobile";
      case "FIXED_LINE":
        return "Landline";
      case "FIXED_LINE_OR_MOBILE":
        return "Mobile / Landline";
      case "VOIP":
        return "VoIP";
      case "TOLL_FREE":
        return "Toll-free";
      default:
        return result.type ? titleCase(result.type) : "Unknown";
    }
  })();

  const rows: Row[] = [
    { key: "carrier", label: "Carrier", value: reveal.carrier ? carrier : undefined },
    { key: "type", label: "Type", value: reveal.type ? typeLabel : undefined },
    { key: "country", label: "Country", value: reveal.country ? result.country ?? "—" : undefined },
    {
      key: "city",
      label: "City",
      value: reveal.city ? (result.citiesHint?.[0] ?? result.region ?? "Unknown") : undefined,
      blurred: reveal.city, // city always stays blurred as paywall tease
    },
    { key: "location", label: "Location", defined: reveal.location },
  ];

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden pb-24">
      <WorldMapBg countryCode={result.countryCode} />

      <div className="relative mx-auto mt-10 max-w-md px-5 sm:px-6">
        <div className="rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-ink-900/5">
          <h1 className="text-center text-xl font-extrabold tracking-tight text-ink-900">
            {currentPhase.title}…
          </h1>
          <div className="mt-3">
            <CountdownBar seconds={seconds} totalMs={currentPhase.totalMs} />
          </div>

          <div className="mt-4 divide-y divide-ink-900/5">
            {rows.map((r) => (
              <Row key={r.key} row={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ row }: { row: Row }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-base text-ink-700">{row.label}</span>
      <RowValue row={row} />
    </div>
  );
}

function RowValue({ row }: { row: Row }) {
  if (row.key === "location") {
    if (row.defined) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-sm font-semibold text-brand-800">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Defined
        </span>
      );
    }
    return <MiniSpinner />;
  }

  if (row.key === "city") {
    if (!row.value) return <MiniSpinner />;
    return (
      <span className="select-none rounded bg-ink-300/70 px-6 py-1 text-transparent blur-[6px]">
        ██████████████
      </span>
    );
  }

  if (!("value" in row) || !row.value) return <MiniSpinner />;

  return <span className="text-base font-bold text-ink-900">{row.value}</span>;
}

function MiniSpinner() {
  return (
    <span
      aria-label="Loading"
      className="inline-block h-4 w-4 animate-spin rounded-full border-[2.5px] border-brand-600/25 border-t-brand-600"
    />
  );
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function sampleCarrier(cc?: string) {
  switch (cc) {
    case "US":
      return sample(["Verizon", "AT&T", "T-Mobile", "Cricket", "Metro by T-Mobile"]);
    case "CA":
      return sample(["Bell", "Rogers", "Telus", "Freedom Mobile"]);
    case "GB":
      return sample(["EE", "O2", "Vodafone", "Three"]);
    case "ES":
      return sample(["Movistar", "Orange", "Vodafone", "Yoigo"]);
    case "FR":
      return sample(["Orange", "SFR", "Bouygues", "Free Mobile"]);
    case "DE":
      return sample(["Deutsche Telekom", "Vodafone", "O2 Telefónica"]);
    case "IT":
      return sample(["TIM", "Vodafone", "Wind Tre", "Iliad"]);
    case "BR":
      return sample(["Vivo", "Claro", "TIM", "Oi"]);
    case "MX":
      return sample(["Telcel", "AT&T México", "Movistar"]);
    case "IN":
      return sample(["Airtel", "Jio", "Vi (Vodafone Idea)", "BSNL"]);
    case "AU":
      return sample(["Telstra", "Optus", "Vodafone AU"]);
    case "IL":
      return sample(["Cellcom", "Pelephone", "Partner", "HOT Mobile"]);
    default:
      return "Local carrier";
  }
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
