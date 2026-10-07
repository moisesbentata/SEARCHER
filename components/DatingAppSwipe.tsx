"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Blurred app-logo swipe that sits inline next to a single loading row.
 *
 * Given a `startedAt` timestamp (performance.now()) and the total time the
 * row will wait before it ticks (`durationMs`), the component shows the
 * first image for the first `firstPhasePct` of the time, then cross-fades
 * to the second image for the remainder.
 *
 * The two image sources are passed in as paths. The component does not know
 * or care what the files are; it just renders what the browser fetches.
 */
export function DatingAppSwipe({
  startedAt,
  durationMs,
  logoAUrl,
  logoBUrl,
  firstPhasePct = 0.4,
  blurPx = 2.5,
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

  const elapsed = Math.max(0, performance.now() - startedAt);
  const switchAt = durationMs * firstPhasePct;
  const crossFadeMs = 400;

  // Cross-fade centered on `switchAt`
  let aOpacity = 1;
  let bOpacity = 0;
  const fadeStart = switchAt - crossFadeMs / 2;
  if (elapsed > fadeStart) {
    const t = Math.min(1, (elapsed - fadeStart) / crossFadeMs);
    aOpacity = 1 - t;
    bOpacity = t;
  }

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
          filter: `blur(${blurPx}px)`,
          opacity: aOpacity,
          transition: "opacity 60ms linear",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoBUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          filter: `blur(${blurPx}px)`,
          opacity: bOpacity,
          transition: "opacity 60ms linear",
        }}
      />
    </span>
  );
}
