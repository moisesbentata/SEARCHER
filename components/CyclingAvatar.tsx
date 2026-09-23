"use client";

import { useEffect, useState } from "react";

// A rotating gallery of hand-drawn "photo" scenes. Each is an inline SVG built
// from simple shapes (heads, bodies, sky, bokeh lights) so when the whole
// thing is blurred at 8px it reads like an actual blurred candid photo — a
// selfie, a shot at a club, a group photo — without ever containing a real
// person. Real photos would be a privacy/rights problem here.

type SceneRenderer = () => JSX.Element;

const SCENES: SceneRenderer[] = [
  // Selfie portrait — warm indoor light
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="bg1" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f7d9c7" />
          <stop offset="100%" stopColor="#b57a5c" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg1)" />
      {/* Neck / shoulders */}
      <path d="M0 100 Q 50 60 100 100 Z" fill="#7a4630" opacity="0.85" />
      {/* Head */}
      <ellipse cx="50" cy="42" rx="22" ry="26" fill="#f0b492" />
      {/* Hair */}
      <path d="M28 32 Q 50 8 72 32 Q 74 22 50 12 Q 26 22 28 32 Z" fill="#2a1a12" />
      <path d="M28 40 Q 26 60 32 68 L 30 48 Z" fill="#2a1a12" />
      <path d="M72 40 Q 74 60 68 68 L 70 48 Z" fill="#2a1a12" />
    </svg>
  ),
  // Club dance floor — dark with bokeh lights
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1a0330" />
          <stop offset="100%" stopColor="#0a0018" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg2)" />
      {/* Bokeh lights */}
      <circle cx="18" cy="18" r="10" fill="#ff2fa6" opacity="0.85" />
      <circle cx="82" cy="22" r="8" fill="#3ec1ff" opacity="0.85" />
      <circle cx="70" cy="8" r="6" fill="#c66bff" opacity="0.8" />
      <circle cx="10" cy="42" r="7" fill="#ffb03e" opacity="0.75" />
      <circle cx="90" cy="55" r="9" fill="#ff4d6b" opacity="0.8" />
      <circle cx="30" cy="60" r="5" fill="#79ffb0" opacity="0.7" />
      {/* Silhouetted crowd heads */}
      <ellipse cx="25" cy="82" rx="12" ry="14" fill="#050010" />
      <ellipse cx="52" cy="78" rx="14" ry="16" fill="#0b0018" />
      <ellipse cx="80" cy="84" rx="12" ry="14" fill="#050010" />
      <path d="M0 100 Q 50 70 100 100 Z" fill="#000" />
    </svg>
  ),
  // Restaurant / candlelit — amber warm
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="bg3" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#ffdc7a" />
          <stop offset="60%" stopColor="#a35b26" />
          <stop offset="100%" stopColor="#3a1a08" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg3)" />
      {/* Candle glow */}
      <circle cx="30" cy="55" r="6" fill="#ffe89a" />
      {/* Figure */}
      <ellipse cx="65" cy="45" rx="18" ry="22" fill="#c9855c" />
      <path d="M52 60 Q 65 82 78 60 L 84 100 L 46 100 Z" fill="#2a1a10" />
      <path d="M48 30 Q 65 12 82 30 Q 84 22 65 15 Q 46 22 48 30 Z" fill="#12080a" />
    </svg>
  ),
  // Beach / vacation — sky + horizon + figure
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg4" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#88c9f0" />
          <stop offset="60%" stopColor="#e8d59c" />
          <stop offset="100%" stopColor="#d9a56a" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg4)" />
      {/* Sun */}
      <circle cx="72" cy="28" r="10" fill="#fff2c2" opacity="0.9" />
      {/* Sea horizon */}
      <rect y="55" width="100" height="8" fill="#2a7fb4" opacity="0.6" />
      {/* Figure silhouette */}
      <ellipse cx="45" cy="52" rx="10" ry="12" fill="#3a2a1a" opacity="0.85" />
      <path d="M32 68 Q 45 88 58 68 L 62 100 L 28 100 Z" fill="#3a2a1a" opacity="0.85" />
    </svg>
  ),
  // Concert crowd — stage lights + silhouettes
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg5" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3a0d5a" />
          <stop offset="60%" stopColor="#160522" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg5)" />
      {/* Stage light beams */}
      <path d="M20 0 L 10 100 L 32 100 L 40 0 Z" fill="#8b3fff" opacity="0.35" />
      <path d="M60 0 L 68 100 L 90 100 L 80 0 Z" fill="#ff4488" opacity="0.35" />
      {/* Bokeh spot */}
      <circle cx="50" cy="20" r="9" fill="#ffe75a" opacity="0.7" />
      {/* Crowd */}
      <path d="M0 100 Q 12 74 24 100 Z" fill="#000" />
      <path d="M20 100 Q 34 70 48 100 Z" fill="#000" />
      <path d="M40 100 Q 55 68 70 100 Z" fill="#000" />
      <path d="M62 100 Q 78 72 92 100 Z" fill="#000" />
      <circle cx="14" cy="82" r="6" fill="#000" />
      <circle cx="36" cy="78" r="7" fill="#000" />
      <circle cx="58" cy="76" r="7" fill="#000" />
      <circle cx="80" cy="82" r="6" fill="#000" />
    </svg>
  ),
  // Group photo — three faces on a warm background
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg6" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f0c47a" />
          <stop offset="100%" stopColor="#8a5a30" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg6)" />
      {/* Bodies */}
      <path d="M0 100 Q 15 74 30 100 Z" fill="#3b2a1a" />
      <path d="M28 100 Q 50 68 72 100 Z" fill="#3b2a1a" />
      <path d="M70 100 Q 85 74 100 100 Z" fill="#3b2a1a" />
      {/* Heads */}
      <circle cx="18" cy="50" r="12" fill="#e0a878" />
      <path d="M6 46 Q 18 34 30 46 Q 32 40 18 34 Q 4 40 6 46 Z" fill="#221108" />
      <circle cx="50" cy="42" r="14" fill="#f0b892" />
      <path d="M36 42 Q 50 26 64 42 Q 66 34 50 28 Q 34 34 36 42 Z" fill="#3a1f10" />
      <circle cx="82" cy="50" r="12" fill="#c88860" />
      <path d="M70 46 Q 82 32 94 46 Q 96 38 82 32 Q 68 38 70 46 Z" fill="#1a0805" />
    </svg>
  ),
  // Bathroom mirror selfie — tiled wall + figure + flash
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg7" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e4ebf0" />
          <stop offset="100%" stopColor="#a2b0bc" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg7)" />
      {/* Tile grid */}
      <line x1="0" y1="33" x2="100" y2="33" stroke="#7f8d99" strokeWidth="0.6" />
      <line x1="0" y1="66" x2="100" y2="66" stroke="#7f8d99" strokeWidth="0.6" />
      <line x1="33" y1="0" x2="33" y2="100" stroke="#7f8d99" strokeWidth="0.6" />
      <line x1="66" y1="0" x2="66" y2="100" stroke="#7f8d99" strokeWidth="0.6" />
      {/* Flash blob */}
      <circle cx="72" cy="30" r="14" fill="#fffbe8" opacity="0.9" />
      {/* Figure */}
      <ellipse cx="40" cy="48" rx="16" ry="20" fill="#d4a186" />
      <path d="M22 62 Q 40 84 58 62 L 62 100 L 18 100 Z" fill="#1a1a24" />
      <path d="M24 40 Q 40 22 56 40 Q 58 26 40 22 Q 22 26 24 40 Z" fill="#241812" />
    </svg>
  ),
  // Night out / bar — red neon + face
  () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="bg8" cx="50%" cy="55%" r="70%">
          <stop offset="0%" stopColor="#ff5a7a" />
          <stop offset="100%" stopColor="#380818" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg8)" />
      {/* Neon streaks */}
      <rect x="4" y="12" width="30" height="2" fill="#ff2fa6" />
      <rect x="60" y="18" width="36" height="2" fill="#3ec1ff" />
      {/* Figure */}
      <ellipse cx="50" cy="52" rx="20" ry="24" fill="#c8846b" />
      <path d="M30 68 Q 50 92 70 68 L 76 100 L 24 100 Z" fill="#12060a" />
      <path d="M30 44 Q 50 22 70 44 Q 72 28 50 20 Q 28 28 30 44 Z" fill="#0a0405" />
    </svg>
  ),
];

export function CyclingAvatar({ intervalMs = 1400 }: { intervalMs?: number }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCENES.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  const Scene = SCENES[idx];

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg animate-avatar-cycle">
      <div
        className="absolute inset-0"
        style={{
          filter: "blur(8px)",
          transform: "scale(1.15)", // hide edge blur softening
        }}
      >
        <Scene />
      </div>
      <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white ring-2 ring-white">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>
    </div>
  );
}
