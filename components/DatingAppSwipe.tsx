"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Inline app-logo swipe for a single loading row.
 *
 * The whole animation runs over `durationMs`, split by `firstPhasePct`:
 *   [0 .. durationMs * firstPhasePct]            → Phase A (Logo A)
 *   [durationMs * firstPhasePct .. durationMs]   → Phase B (Logo B)
 *
 * The LAST 1 second of each phase is subdivided into 0.5s spinner + 0.5s
 * tick (that 1s is drawn FROM the phase's own budget — it's not added on
 * top). The Phase B tick therefore ends exactly at `durationMs`, so it
 * can be scheduled to pop in the same frame as the enclosing row's own
 * left-side completion tick.
 *
 * Example — durationMs 19000, firstPhasePct 0.4:
 *   0 .. 6600   Logo A
 *   6600 .. 7100 spinner
 *   7100 .. 7600 tick A
 *   7600 .. 18000 Logo B
 *   18000 .. 18500 spinner
 *   18500 .. 19000 tick B
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
  const TRANSITION_MS = SPIN_MS + TICK_MS;
  const elapsed = Math.max(0, performance.now() - startedAt);

  const phaseAEnd = durationMs * firstPhasePct; // boundary between Logo A and Logo B halves
  // Spinner/tick for each phase eat the final 1s of that phase's budget.
  const T_SPIN_A_START = phaseAEnd - TRANSITION_MS;
  const T_TICK_A_START = phaseAEnd - TICK_MS;
  const T_SPIN_B_START = durationMs - TRANSITION_MS;
  const T_TICK_B_START = durationMs - TICK_MS;

  let phase: "logoA" | "spinA" | "tickA" | "logoB" | "spinB" | "tickB";
  if (elapsed < T_SPIN_A_START) phase = "logoA";
  else if (elapsed < T_TICK_A_START) phase = "spinA";
  else if (elapsed < phaseAEnd) phase = "tickA";
  else if (elapsed < T_SPIN_B_START) phase = "logoB";
  else if (elapsed < T_TICK_B_START) phase = "spinB";
  else phase = "tickB";

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
