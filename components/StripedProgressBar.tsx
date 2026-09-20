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
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-600 bg-progress-stripes bg-stripe animate-stripe-shift transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
      {showPercent ? (
        <div className="absolute inset-0 flex items-center justify-end pr-3">
          <span className="text-sm font-semibold text-ink-900">
            {Math.round(clamped)} %
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
        className="h-full rounded-full bg-accent-500 transition-[width] duration-300 ease-linear"
        style={{ width: `${percent}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-end pr-3">
        <span className="text-sm font-semibold text-ink-800">{seconds}s</span>
      </div>
    </div>
  );
}
