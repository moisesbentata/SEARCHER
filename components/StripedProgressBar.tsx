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
      {/* Filled portion: solid brand-blue base with a diagonal stripe overlay */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out"
        style={{
          width: `${clamped}%`,
          // layered background: white stripes ON TOP of the blue fill
          backgroundColor: "#0284c7",
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.30) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.30) 50%, rgba(255,255,255,0.30) 75%, transparent 75%, transparent)",
          backgroundSize: "28px 28px",
          animation: "stripe-shift 0.9s linear infinite",
          boxShadow: "inset 0 0 0 1px rgba(2,132,199,0.4)",
        }}
      />
      {showPercent ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-3">
          <span
            className="text-sm font-bold text-ink-900"
            style={{
              textShadow: "0 1px 0 rgba(255,255,255,0.6)",
            }}
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
        className="h-full rounded-full transition-[width] duration-300 ease-linear"
        style={{
          width: `${percent}%`,
          backgroundColor: "#0284c7",
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.28) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.28) 75%, transparent 75%, transparent)",
          backgroundSize: "24px 24px",
          animation: "stripe-shift 0.9s linear infinite",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-3">
        <span
          className="text-sm font-bold text-ink-900"
          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
        >
          {seconds}s
        </span>
      </div>
    </div>
  );
}
