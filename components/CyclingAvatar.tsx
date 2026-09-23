"use client";

import { useEffect, useState } from "react";

// A rotating gallery of "photo" scenes rendered as inline SVG. Every scene
// composes overlapping soft radial-gradient blobs (never hard rectangles or
// polygons) so that at ~6px blur they read like actual candid iPhone photos —
// soft depth, ambient lighting, grain — instead of geometric drawings.

type SceneRenderer = () => JSX.Element;

// Shared photo-effect overlay: film grain + corner vignette. Rendered as a
// group at the end of each scene so it sits on top of the scene contents.
function PhotoOverlay({ id }: { id: string }) {
  return (
    <>
      <defs>
        <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix
            values="0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0.12 0"
          />
        </filter>
        <radialGradient id={`vignette-${id}`} cx="50%" cy="50%" r="65%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" filter={`url(#grain-${id})`} />
      <rect width="100" height="100" fill={`url(#vignette-${id})`} />
    </>
  );
}

const SCENES: SceneRenderer[] = [
  // 1 — Selfie portrait, warm indoor light
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="s1-bg" cx="40%" cy="30%" r="90%">
          <stop offset="0%" stopColor="#f7d9c7" />
          <stop offset="55%" stopColor="#c48762" />
          <stop offset="100%" stopColor="#5a2f1c" />
        </radialGradient>
        <radialGradient id="s1-skin" cx="50%" cy="45%" r="35%">
          <stop offset="0%" stopColor="#f7c5a0" />
          <stop offset="70%" stopColor="#c88760" />
          <stop offset="100%" stopColor="#c88760" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s1-hair" cx="50%" cy="22%" r="40%">
          <stop offset="0%" stopColor="#2a1a12" />
          <stop offset="60%" stopColor="#2a1a12" />
          <stop offset="100%" stopColor="#2a1a12" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s1-shirt" cx="50%" cy="95%" r="55%">
          <stop offset="0%" stopColor="#5a3826" />
          <stop offset="100%" stopColor="#5a3826" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s1-rim" cx="80%" cy="35%" r="25%">
          <stop offset="0%" stopColor="#ffe7cc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffe7cc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s1-bg)" />
      <rect width="100" height="100" fill="url(#s1-shirt)" />
      <rect width="100" height="100" fill="url(#s1-skin)" />
      <rect width="100" height="100" fill="url(#s1-hair)" />
      <rect width="100" height="100" fill="url(#s1-rim)" />
      <PhotoOverlay id="s1" />
    </svg>
  ),

  // 2 — Club dance floor with bokeh
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="s2-bg" cx="50%" cy="45%" r="85%">
          <stop offset="0%" stopColor="#2a0a48" />
          <stop offset="100%" stopColor="#050010" />
        </radialGradient>
        <radialGradient id="s2-b1" cx="18%" cy="20%" r="18%">
          <stop offset="0%" stopColor="#ff2fa6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff2fa6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s2-b2" cx="82%" cy="24%" r="15%">
          <stop offset="0%" stopColor="#3ec1ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3ec1ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s2-b3" cx="70%" cy="8%" r="12%">
          <stop offset="0%" stopColor="#c66bff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c66bff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s2-b4" cx="10%" cy="48%" r="14%">
          <stop offset="0%" stopColor="#ffb03e" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffb03e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s2-b5" cx="92%" cy="60%" r="18%">
          <stop offset="0%" stopColor="#ff4d6b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff4d6b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s2-crowd" cx="50%" cy="105%" r="65%">
          <stop offset="0%" stopColor="#000" />
          <stop offset="55%" stopColor="#000" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s2-bg)" />
      <rect width="100" height="100" fill="url(#s2-b1)" />
      <rect width="100" height="100" fill="url(#s2-b2)" />
      <rect width="100" height="100" fill="url(#s2-b3)" />
      <rect width="100" height="100" fill="url(#s2-b4)" />
      <rect width="100" height="100" fill="url(#s2-b5)" />
      <rect width="100" height="100" fill="url(#s2-crowd)" />
      <PhotoOverlay id="s2" />
    </svg>
  ),

  // 3 — Restaurant / candlelit
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="s3-bg" cx="60%" cy="48%" r="90%">
          <stop offset="0%" stopColor="#ffdc7a" />
          <stop offset="55%" stopColor="#a35b26" />
          <stop offset="100%" stopColor="#2a120a" />
        </radialGradient>
        <radialGradient id="s3-candle" cx="28%" cy="58%" r="15%">
          <stop offset="0%" stopColor="#fff2c2" stopOpacity="1" />
          <stop offset="60%" stopColor="#ffb85c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s3-figure" cx="66%" cy="48%" r="35%">
          <stop offset="0%" stopColor="#c9855c" />
          <stop offset="60%" stopColor="#7a4a2a" />
          <stop offset="100%" stopColor="#7a4a2a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s3-hair" cx="66%" cy="24%" r="25%">
          <stop offset="0%" stopColor="#180a06" />
          <stop offset="70%" stopColor="#180a06" />
          <stop offset="100%" stopColor="#180a06" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s3-bg)" />
      <rect width="100" height="100" fill="url(#s3-figure)" />
      <rect width="100" height="100" fill="url(#s3-hair)" />
      <rect width="100" height="100" fill="url(#s3-candle)" />
      <PhotoOverlay id="s3" />
    </svg>
  ),

  // 4 — Beach / vacation
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="s4-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a4d7f2" />
          <stop offset="50%" stopColor="#f0d29e" />
          <stop offset="100%" stopColor="#c48a58" />
        </linearGradient>
        <radialGradient id="s4-sun" cx="70%" cy="28%" r="18%">
          <stop offset="0%" stopColor="#fff2c2" stopOpacity="1" />
          <stop offset="70%" stopColor="#ffd985" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffd985" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s4-sea" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#2a7fb4" stopOpacity="0.55" />
          <stop offset="30%" stopColor="#2a7fb4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2a7fb4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s4-fig" cx="42%" cy="65%" r="18%">
          <stop offset="0%" stopColor="#2a1a10" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#2a1a10" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2a1a10" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s4-sky)" />
      <rect width="100" height="100" fill="url(#s4-sea)" />
      <rect width="100" height="100" fill="url(#s4-sun)" />
      <rect width="100" height="100" fill="url(#s4-fig)" />
      <PhotoOverlay id="s4" />
    </svg>
  ),

  // 5 — Concert crowd with stage lights
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="s5-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3a0d5a" />
          <stop offset="65%" stopColor="#150420" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <radialGradient id="s5-l1" cx="20%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#8b3fff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#8b3fff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8b3fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s5-l2" cx="80%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#ff4488" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ff4488" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ff4488" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s5-spot" cx="50%" cy="18%" r="20%">
          <stop offset="0%" stopColor="#ffe75a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe75a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s5-crowd" cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor="#000" />
          <stop offset="55%" stopColor="#000" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s5-bg)" />
      <rect width="100" height="100" fill="url(#s5-l1)" />
      <rect width="100" height="100" fill="url(#s5-l2)" />
      <rect width="100" height="100" fill="url(#s5-spot)" />
      <rect width="100" height="100" fill="url(#s5-crowd)" />
      <PhotoOverlay id="s5" />
    </svg>
  ),

  // 6 — Group photo of three friends
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="s6-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f0c47a" />
          <stop offset="100%" stopColor="#6a4020" />
        </linearGradient>
        <radialGradient id="s6-f1" cx="20%" cy="50%" r="22%">
          <stop offset="0%" stopColor="#e0a878" />
          <stop offset="70%" stopColor="#a56a44" />
          <stop offset="100%" stopColor="#a56a44" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s6-f2" cx="50%" cy="42%" r="26%">
          <stop offset="0%" stopColor="#f0b892" />
          <stop offset="70%" stopColor="#b7815a" />
          <stop offset="100%" stopColor="#b7815a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s6-f3" cx="80%" cy="50%" r="22%">
          <stop offset="0%" stopColor="#c88860" />
          <stop offset="70%" stopColor="#8c5a3a" />
          <stop offset="100%" stopColor="#8c5a3a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s6-bod" cx="50%" cy="105%" r="70%">
          <stop offset="0%" stopColor="#3b2a1a" />
          <stop offset="45%" stopColor="#3b2a1a" />
          <stop offset="100%" stopColor="#3b2a1a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s6-bg)" />
      <rect width="100" height="100" fill="url(#s6-bod)" />
      <rect width="100" height="100" fill="url(#s6-f1)" />
      <rect width="100" height="100" fill="url(#s6-f2)" />
      <rect width="100" height="100" fill="url(#s6-f3)" />
      <PhotoOverlay id="s6" />
    </svg>
  ),

  // 7 — Bathroom mirror selfie with flash
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="s7-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e4ebf0" />
          <stop offset="100%" stopColor="#8a97a3" />
        </linearGradient>
        <radialGradient id="s7-flash" cx="75%" cy="28%" r="28%">
          <stop offset="0%" stopColor="#fffbe8" stopOpacity="1" />
          <stop offset="50%" stopColor="#fffbe8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fffbe8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s7-fig" cx="38%" cy="52%" r="35%">
          <stop offset="0%" stopColor="#d4a186" />
          <stop offset="65%" stopColor="#7f5a44" />
          <stop offset="100%" stopColor="#7f5a44" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s7-hair" cx="38%" cy="30%" r="22%">
          <stop offset="0%" stopColor="#241812" />
          <stop offset="70%" stopColor="#241812" />
          <stop offset="100%" stopColor="#241812" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s7-clothes" cx="38%" cy="100%" r="55%">
          <stop offset="0%" stopColor="#1a1a24" />
          <stop offset="50%" stopColor="#1a1a24" />
          <stop offset="100%" stopColor="#1a1a24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s7-bg)" />
      <rect width="100" height="100" fill="url(#s7-clothes)" />
      <rect width="100" height="100" fill="url(#s7-fig)" />
      <rect width="100" height="100" fill="url(#s7-hair)" />
      <rect width="100" height="100" fill="url(#s7-flash)" />
      <PhotoOverlay id="s7" />
    </svg>
  ),

  // 8 — Night out / bar red neon
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="s8-bg" cx="50%" cy="55%" r="85%">
          <stop offset="0%" stopColor="#ff5a7a" />
          <stop offset="70%" stopColor="#7a1830" />
          <stop offset="100%" stopColor="#1a0208" />
        </radialGradient>
        <radialGradient id="s8-neon1" cx="18%" cy="14%" r="30%">
          <stop offset="0%" stopColor="#ff2fa6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ff2fa6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s8-neon2" cx="82%" cy="20%" r="32%">
          <stop offset="0%" stopColor="#3ec1ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3ec1ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s8-fig" cx="50%" cy="55%" r="40%">
          <stop offset="0%" stopColor="#c88466" />
          <stop offset="65%" stopColor="#5a2410" />
          <stop offset="100%" stopColor="#5a2410" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s8-hair" cx="50%" cy="30%" r="26%">
          <stop offset="0%" stopColor="#0a0405" />
          <stop offset="70%" stopColor="#0a0405" />
          <stop offset="100%" stopColor="#0a0405" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s8-bg)" />
      <rect width="100" height="100" fill="url(#s8-neon1)" />
      <rect width="100" height="100" fill="url(#s8-neon2)" />
      <rect width="100" height="100" fill="url(#s8-fig)" />
      <rect width="100" height="100" fill="url(#s8-hair)" />
      <PhotoOverlay id="s8" />
    </svg>
  ),

  // 9 — Bedroom scene: warm ambient, duvet, pillows, lamp glow
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="s9-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f4d9b8" />
          <stop offset="60%" stopColor="#b48660" />
          <stop offset="100%" stopColor="#6a3d24" />
        </linearGradient>
        <radialGradient id="s9-lamp" cx="18%" cy="20%" r="42%">
          <stop offset="0%" stopColor="#fff2c2" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#ffb85c" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s9-headboard" cx="50%" cy="48%" r="60%">
          <stop offset="0%" stopColor="#6a4a30" stopOpacity="0.8" />
          <stop offset="55%" stopColor="#6a4a30" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#6a4a30" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s9-pillow1" cx="26%" cy="58%" r="22%">
          <stop offset="0%" stopColor="#f6ecd8" />
          <stop offset="70%" stopColor="#c9b48f" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c9b48f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s9-pillow2" cx="74%" cy="58%" r="22%">
          <stop offset="0%" stopColor="#f6ecd8" />
          <stop offset="70%" stopColor="#c9b48f" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c9b48f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s9-duvet" cx="50%" cy="105%" r="80%">
          <stop offset="0%" stopColor="#c48a5c" />
          <stop offset="55%" stopColor="#8c5a34" />
          <stop offset="100%" stopColor="#8c5a34" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#s9-wall)" />
      <rect width="100" height="100" fill="url(#s9-duvet)" />
      <rect width="100" height="100" fill="url(#s9-headboard)" />
      <rect width="100" height="100" fill="url(#s9-pillow1)" />
      <rect width="100" height="100" fill="url(#s9-pillow2)" />
      <rect width="100" height="100" fill="url(#s9-lamp)" />
      <PhotoOverlay id="s9" />
    </svg>
  ),
];

export function CyclingAvatar({ intervalMs = 1500 }: { intervalMs?: number }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCENES.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  const Scene = SCENES[idx];

  return (
    <div className="relative h-16 w-16 shrink-0 animate-avatar-cycle">
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div
          className="absolute inset-0"
          style={{
            filter: "blur(6px)",
            transform: "scale(1.14)",
          }}
        >
          <Scene />
        </div>
      </div>
      <div className="absolute -bottom-1.5 -right-1.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-white shadow-md ring-2 ring-white">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>
    </div>
  );
}
