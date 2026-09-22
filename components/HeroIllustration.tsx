// Hero illustration: a soft blue backdrop with a stack of contact cards, one
// highlighted with a phone avatar + check badge, plus a magnifying glass and
// a search-pill floating at the top. Original SVG built from scratch — evokes
// "identify the right person from a stack of matches" without copying any
// specific existing artwork.
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 560 560"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full max-w-md"
      aria-hidden
    >
      <defs>
        <radialGradient id="bgBlob" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cardEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="activeEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>

      {/* Soft background blob */}
      <circle cx="290" cy="270" r="240" fill="url(#bgBlob)" />

      {/* Dashed orbit line for depth */}
      <ellipse
        cx="290"
        cy="290"
        rx="230"
        ry="200"
        fill="none"
        stroke="#7dd3fc"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      {/* Search pill at top */}
      <g transform="translate(120, 60)">
        <rect
          x="0"
          y="0"
          width="340"
          height="60"
          rx="30"
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <circle cx="42" cy="30" r="12" fill="none" stroke="#0ea5e9" strokeWidth="3" />
        <line x1="51" y1="39" x2="60" y2="48" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
        <rect x="80" y="25" width="220" height="10" rx="5" fill="#e2e8f0" />
      </g>

      {/* Card 1 — dim, top left */}
      <ContactCard x={70} y={175} width={260} active={false} />

      {/* Card 2 — dim, bottom left */}
      <ContactCard x={90} y={410} width={260} active={false} />

      {/* Card 3 — dim, right */}
      <ContactCard x={310} y={450} width={230} active={false} />

      {/* Highlighted card — center, biggest, active */}
      <g>
        <rect
          x="130"
          y="270"
          width="330"
          height="120"
          rx="18"
          fill="white"
          stroke="url(#activeEdge)"
          strokeWidth="3"
        />

        {/* Avatar circle */}
        <circle cx="185" cy="330" r="30" fill="#e0f2fe" />
        {/* User silhouette head */}
        <circle cx="185" cy="321" r="9" fill="#0284c7" />
        {/* User silhouette shoulders */}
        <path
          d="M167 350 a18 18 0 0 1 36 0 z"
          fill="#0284c7"
        />

        {/* Phone badge on avatar */}
        <circle cx="207" cy="352" r="12" fill="url(#badge)" stroke="white" strokeWidth="2" />
        <path
          d="M201 350 q0 -2 2 -2 h1 q2 0 2 2 v1 q0 2 -0.5 2.5 l-1 1 q1 2 3 3 l1 -1 q0.5 -0.5 2.5 -0.5 h1 q2 0 2 2 v1 q0 2 -2 2 q-7 0 -12 -5 q-5 -5 -5 -12 z"
          fill="white"
        />

        {/* Lines */}
        <rect x="230" y="305" width="180" height="10" rx="5" fill="#38bdf8" />
        <rect x="230" y="325" width="200" height="7" rx="3.5" fill="#e2e8f0" />
        <rect x="230" y="340" width="160" height="7" rx="3.5" fill="#e2e8f0" />

        {/* Check badge floating on top-right corner */}
        <g transform="translate(430, 250)">
          {/* Sparkle rays */}
          <g stroke="#38bdf8" strokeWidth="3" strokeLinecap="round">
            <line x1="30" y1="-10" x2="30" y2="-20" />
            <line x1="55" y1="10" x2="65" y2="5" />
            <line x1="10" y1="10" x2="0" y2="5" />
            <line x1="48" y1="-6" x2="56" y2="-14" />
          </g>
          <circle cx="30" cy="30" r="26" fill="url(#badge)" />
          <path
            d="M18 30 l9 9 l15 -18"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* Magnifying glass — bottom left */}
      <g transform="translate(50, 380)">
        <circle cx="60" cy="60" r="46" fill="white" stroke="url(#glass)" strokeWidth="9" />
        <circle cx="60" cy="60" r="34" fill="#f0f9ff" fillOpacity="0.7" />
        <rect
          x="92"
          y="92"
          width="54"
          height="14"
          rx="7"
          fill="url(#glass)"
          transform="rotate(45 92 92)"
        />
      </g>
    </svg>
  );
}

function ContactCard({
  x,
  y,
  width,
  active,
}: {
  x: number;
  y: number;
  width: number;
  active: boolean;
}) {
  const stroke = active ? "url(#activeEdge)" : "url(#cardEdge)";
  const strokeWidth = active ? 2.5 : 1.5;
  const opacity = active ? 1 : 0.55;
  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={y}
        width={width}
        height={90}
        rx="16"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <circle cx={x + 40} cy={y + 45} r="20" fill="#e2e8f0" />
      <circle cx={x + 40} cy={y + 39} r="6" fill="#cbd5e1" />
      <path d={`M${x + 25} ${y + 60} a15 15 0 0 1 30 0 z`} fill="#cbd5e1" />
      <rect x={x + 75} y={y + 30} rx="4" width={width - 100} height="8" fill="#e2e8f0" />
      <rect x={x + 75} y={y + 46} rx="3" width={width - 130} height="6" fill="#e2e8f0" />
      <rect x={x + 75} y={y + 58} rx="3" width={width - 150} height="6" fill="#e2e8f0" />
    </g>
  );
}
