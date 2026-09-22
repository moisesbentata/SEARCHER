// Right-side hero illustration: a stack of "contact" cards, one highlighted
// with a checkmark, plus a magnifying glass in the corner. Original SVG art —
// evokes "identifying the right person" without copying any specific existing
// illustration.
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 520 480"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full max-w-md"
      aria-hidden
    >
      <defs>
        <linearGradient id="cardBorder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="activeBorder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="check" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>

      {/* Row 1 (dimmed) */}
      <ContactCard x={70} y={30} active={false} />

      {/* Row 2 — active with check */}
      <ContactCard x={30} y={120} active accent width={470} />
      {/* Green check badge on active card */}
      <circle cx="475" cy="130" r="20" fill="url(#check)" />
      <path
        d="M466 130 L473 137 L484 124"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Row 3 (dimmed) */}
      <ContactCard x={70} y={220} active={false} />

      {/* Row 4 (dimmed) */}
      <ContactCard x={70} y={310} active={false} />

      {/* Magnifying glass */}
      <g transform="translate(360, 340)">
        <circle cx="45" cy="45" r="38" fill="none" stroke="url(#glass)" strokeWidth="7" />
        <circle cx="45" cy="45" r="30" fill="#f0f9ff" fillOpacity="0.55" />
        <rect
          x="72"
          y="72"
          width="52"
          height="12"
          rx="6"
          fill="url(#glass)"
          transform="rotate(45 72 72)"
        />
      </g>
    </svg>
  );
}

function ContactCard({
  x,
  y,
  active,
  accent,
  width = 430,
}: {
  x: number;
  y: number;
  active: boolean;
  accent?: boolean;
  width?: number;
}) {
  const stroke = active ? "url(#activeBorder)" : "url(#cardBorder)";
  const strokeWidth = active ? 2.5 : 1.5;
  const height = 72;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="14"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <circle cx={x + 36} cy={y + height / 2} r="18" fill={active ? "#e0f2fe" : "#f1f5f9"} />
      {active ? (
        // Phone icon inside active avatar
        <path
          d={`M${x + 30} ${y + height / 2 - 6} q0 -3 3 -3 h2 q3 0 3 3 v2 q0 3 -1 4 l-2 2 q2 4 6 6 l2 -2 q1 -1 4 -1 h2 q3 0 3 3 v2 q0 3 -3 3 q-11 0 -19 -8 q-8 -8 -8 -19 z`}
          fill={accent ? "#0284c7" : "#94a3b8"}
        />
      ) : (
        <>
          <circle cx={x + 36} cy={y + 30} r="5" fill="#cbd5e1" />
          <path
            d={`M${x + 24} ${y + 52} a12 12 0 0 1 24 0`}
            fill="#cbd5e1"
          />
        </>
      )}
      <rect x={x + 66} y={y + 22} rx="3" width={active ? 90 : 130} height="6" fill={active ? "#0284c7" : "#cbd5e1"} />
      <rect x={x + 66} y={y + 36} rx="3" width="200" height="4" fill="#e2e8f0" />
      <rect x={x + 66} y={y + 46} rx="3" width="170" height="4" fill="#e2e8f0" />
    </g>
  );
}
