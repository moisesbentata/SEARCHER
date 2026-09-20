"use client";

import { useEffect, useState } from "react";

// Generic colored "face-like" gradient placeholders. Blurred at 8px, they read
// as an unrevealed person without ever showing a real face.
const FACES = [
  ["#f5b6a9", "#c47466"],
  ["#f6d6a3", "#c48b46"],
  ["#c4d9a3", "#6e8a46"],
  ["#a3c9d9", "#4670a6"],
  ["#c9a3d9", "#7a46b0"],
  ["#d9a3b8", "#a64672"],
  ["#e2c39a", "#8a6a34"],
  ["#a8bfe2", "#3d5aa0"],
];

export function CyclingAvatar({ intervalMs = 800 }: { intervalMs?: number }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % FACES.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  const [c1, c2] = FACES[idx];

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg animate-avatar-cycle">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${c1} 0%, ${c1} 22%, ${c2} 70%, #2a2a2a 100%)`,
          filter: "blur(8px)",
        }}
      />
      {/* Suggestive face-shape overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.18) 25%, transparent 40%), radial-gradient(ellipse at 50% 75%, rgba(0,0,0,0.25) 15%, transparent 40%)",
          filter: "blur(6px)",
        }}
      />
      <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white ring-2 ring-white">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>
    </div>
  );
}
