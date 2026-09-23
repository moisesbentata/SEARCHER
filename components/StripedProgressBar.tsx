// Clean, modern flat-blue progress bar. Bar width is always exactly the
// percent value (no CSS transition), so the visible length tracks the number
// directly — if the percent pauses, the bar physically pauses too.

export function StripedProgressBar({
  percent,
  showPercent = true,
  height = 22,
}: {
  percent: number;
  showPercent?: boolean;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="relative w-full overflow-hidden rounded-full bg-ink-900/[0.06]"
      style={{ height }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped}%`,
          backgroundColor: "#0284c7",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.08)",
        }}
      />
      {showPercent ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-3">
          <span
            className="text-xs font-semibold text-ink-800"
            style={{ textShadow: "0 1px 0 rgba(255,255,255,0.7)" }}
          >
            {Math.round(clamped)}%
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function CountdownBar({
  seconds,
  totalMs,
}: {
  seconds: number;
  totalMs: number;
}) {
  const percent = Math.max(0, 100 - (seconds * 1000) / (totalMs / 100));
  return (
    <div className="relative h-6 w-full overflow-hidden rounded-full bg-ink-900/[0.06]">
      <div
        className="h-full rounded-full transition-[width] duration-200 ease-linear"
        style={{
          width: `${percent}%`,
          backgroundColor: "#0284c7",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.08)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-3">
        <span
          className="text-sm font-bold text-ink-800"
          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
        >
          {seconds}s
        </span>
      </div>
    </div>
  );
}
