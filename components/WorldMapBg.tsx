// Soft "scan grid" backdrop for the phone-lookup stage. Not a real world map —
// a subtle atmospheric background so the card doesn't float on plain white.
export function WorldMapBg({ countryCode }: { countryCode?: string }) {
  // Dashed lat/lon-like grid + a soft radial spot that shifts with country
  const spotX = spotForCountry(countryCode);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden">
      {/* Soft radial vignette in brand-blue */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0.04) 40%, transparent 70%)",
        }}
      />
      {/* Grid pattern */}
      <svg
        viewBox="0 0 400 720"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#0ea5e9" fillOpacity="0.12" />
          </pattern>
          <radialGradient id="spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#0369a1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="400" height="720" fill="url(#dots)" />
        {/* Country focus spot */}
        <ellipse cx={spotX.cx} cy={spotX.cy} rx="160" ry="120" fill="url(#spot)" />
        {/* Pulse ring */}
        <circle
          cx={spotX.cx}
          cy={spotX.cy}
          r="60"
          fill="none"
          stroke="#0369a1"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <circle
          cx={spotX.cx}
          cy={spotX.cy}
          r="16"
          fill="#0369a1"
          fillOpacity="0.75"
        />
      </svg>
    </div>
  );
}

function spotForCountry(code?: string): { cx: number; cy: number } {
  // Rough east-west positioning so the pulse feels "in the right hemisphere"
  const table: Record<string, { cx: number; cy: number }> = {
    US: { cx: 130, cy: 360 },
    CA: { cx: 140, cy: 340 },
    MX: { cx: 130, cy: 400 },
    BR: { cx: 200, cy: 430 },
    GB: { cx: 220, cy: 340 },
    IE: { cx: 210, cy: 345 },
    ES: { cx: 215, cy: 380 },
    FR: { cx: 230, cy: 370 },
    DE: { cx: 240, cy: 355 },
    IT: { cx: 240, cy: 390 },
    RU: { cx: 290, cy: 340 },
    IN: { cx: 300, cy: 400 },
    CN: { cx: 320, cy: 370 },
    JP: { cx: 340, cy: 380 },
    KR: { cx: 335, cy: 380 },
    AU: { cx: 340, cy: 460 },
    IL: { cx: 260, cy: 400 },
  };
  return table[code ?? ""] ?? { cx: 200, cy: 400 };
}
