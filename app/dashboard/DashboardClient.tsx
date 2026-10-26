"use client";

import { useCallback, useEffect, useState } from "react";

type Row = { stage: string; count: number };
type Resp = {
  ok: boolean;
  range: string;
  since: string | null;
  now: string;
  rows: Row[];
};

const RANGES: { key: string; label: string }[] = [
  { key: "24h", label: "Last 24h" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

const STAGE_LABELS: Record<string, string> = {
  LANDING: "Landed on site",
  SEARCH: "Submitted search",
  RESULTS_LOAD: "Results page loaded",
  STAGE_OWNER: "Reached owner info (Stage 2)",
  STAGE_EMAIL: "Reached email capture (Stage 3)",
  LEAD_SUBMIT: "Submitted email",
  STAGE_PAYMENT: "Reached payment (Stage 5)",
  PAY_CLICK: "Clicked Pay",
  PAID: "Completed payment",
};

export function DashboardClient() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/dashboard/funnel?range=${range}`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error(`http_${r.status}`);
      const body = (await r.json()) as Resp;
      setData(body);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "unknown");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rows = data?.rows ?? [];
  const top = rows[0]?.count ?? 0;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            Funnel dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Private — internal use only. Not shown to users.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-sm font-semibold text-ink-800"
          >
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Could not load funnel: {err}
        </div>
      ) : null}

      {!err && !loading && data ? (
        <>
          <div className="mt-8 overflow-hidden rounded-2xl border border-ink-900/5 bg-white">
            {rows.map((r, i) => {
              const prev = i > 0 ? rows[i - 1].count : null;
              const pctOfTop = top > 0 ? (r.count / top) * 100 : 0;
              const pctOfPrev =
                prev !== null && prev > 0 ? (r.count / prev) * 100 : null;
              return (
                <div
                  key={r.stage}
                  className="border-b border-ink-900/5 px-4 py-4 last:border-0 sm:px-6"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                        {String(i + 1).padStart(2, "0")} · {r.stage}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-ink-900">
                        {STAGE_LABELS[r.stage] ?? r.stage}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-2xl font-extrabold tabular-nums text-ink-900">
                        {r.count.toLocaleString()}
                      </div>
                      {pctOfPrev !== null ? (
                        <div className="text-[11px] font-semibold text-ink-500">
                          {pctOfPrev.toFixed(1)}% of previous
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-900/5">
                    <div
                      className="h-full rounded-full bg-ink-900"
                      style={{ width: `${pctOfTop.toFixed(2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-ink-900/5 bg-ink-900/[0.03] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Headline
            </div>
            <div className="mt-1 text-sm text-ink-700">
              Overall landing → paid:{" "}
              <span className="font-bold text-ink-900">
                {top > 0 && rows.length > 0
                  ? (
                      ((rows[rows.length - 1]?.count ?? 0) / top) *
                      100
                    ).toFixed(2)
                  : "0.00"}
                %
              </span>{" "}
              · Landing → clicked Pay:{" "}
              <span className="font-bold text-ink-900">
                {top > 0
                  ? (
                      ((rows.find((r) => r.stage === "PAY_CLICK")?.count ??
                        0) /
                        top) *
                      100
                    ).toFixed(2)
                  : "0.00"}
                %
              </span>
            </div>
            <div className="mt-2 text-xs text-ink-500">
              Counts are unique sessions. Window:{" "}
              {data.since
                ? `${new Date(data.since).toLocaleString()} → ${new Date(data.now).toLocaleString()}`
                : "all time"}
              .
            </div>
          </div>
        </>
      ) : null}

      {loading && !data ? (
        <div className="mt-10 grid place-items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-ink-900/20 border-t-ink-900" />
        </div>
      ) : null}
    </main>
  );
}
