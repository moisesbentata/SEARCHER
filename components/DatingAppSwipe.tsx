"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Inline app-logo swipe for a single loading row.
 *
 * Timeline (relative to `startedAt`, over `durationMs`):
 *   0 .. T_A                       → Logo A visible
 *   T_A .. T_A + 500               → spinner
 *   T_A + 500 .. T_A + 1000        → tick (A completion)
 *   T_A + 1000 .. durationMs - 500 → Logo B visible
 *   durationMs - 500 .. durationMs → spinner
 *   >= durationMs                  → tick (B completion — intended to appear
 *                                     in the same frame as the row's own
 *                                     left-side completion tick)
 *
 * `firstPhasePct` sets T_A as a fraction of durationMs (default 0.4).
 */
export function DatingAppSwipe({
  startedAt,
  durationMs,
  logoAUrl,
  logoBUrl,
  firstPhasePct = 0.4,
  blurPx = 0,
  size = 28,
}: {
  startedAt: number;
  durationMs: number;
  logoAUrl: string;
  logoBUrl: string;
  firstPhasePct?: number;
  blurPx?: number;
  size?: number;
}) {
  const [, forceRender] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function loop() {
      forceRender((n) => (n + 1) % 1_000_000);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startedAt]);

  const SPIN_MS = 500;
  const TICK_MS = 500;
  const elapsed = Math.max(0, performance.now() - startedAt);

  // Compute phase boundaries. If durationMs is too short for the full
  // sequence, fall back to a simple instant swap at firstPhasePct.
  const minForFull = 2 * SPIN_MS + TICK_MS + 500; // need headroom for both logos
  let phase: "logoA" | "spinA" | "tickA" | "logoB" | "spinB" | "tickB";

  if (durationMs < minForFull) {
    phase = elapsed < durationMs * firstPhasePct ? "logoA" : "logoB";
  } else {
    const T_A = durationMs * firstPhasePct;
    const T_SPIN_A_END = T_A + SPIN_MS;
    const T_TICK_A_END = T_SPIN_A_END + TICK_MS;
    const T_SPIN_B_START = durationMs - SPIN_MS;

    if (elapsed < T_A) phase = "logoA";
    else if (elapsed < T_SPIN_A_END) phase = "spinA";
    else if (elapsed < T_TICK_A_END) phase = "tickA";
    else if (elapsed < T_SPIN_B_START) phase = "logoB";
    else if (elapsed < durationMs) phase = "spinB";
    else phase = "tickB";
  }

  const showA = phase === "logoA";
  const showB = phase === "logoB";
  const showSpin = phase === "spinA" || phase === "spinB";
  const showTick = phase === "tickA" || phase === "tickB";

  // Stroke/border scales roughly with icon size.
  const borderPx = Math.max(1.5, size / 10);
  const tickStroke = Math.max(2, Math.round(size / 7));

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoAUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          opacity: showA ? 1 : 0,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoBUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          opacity: showB ? 1 : 0,
        }}
      />
      {showSpin ? (
        <span
          className="absolute inset-0 inline-block animate-spin rounded-full border-brand-600/20 border-t-brand-600"
          style={{ borderWidth: `${borderPx}px` }}
        />
      ) : null}
      {showTick ? (
        <span className="absolute inset-0 flex items-center justify-center animate-fade-in">
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full text-brand-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={tickStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}
