"use client";

import { useEffect, useState } from "react";
import { CyclingAvatar } from "@/components/CyclingAvatar";
import { StripedProgressBar } from "@/components/StripedProgressBar";

type Section = {
  title: string;
  items: string[];
};

const PHONE_SECTIONS: Section[] = [
  {
    title: "Collecting Data",
    items: [
      "Addresses",
      "Forgotten Profiles",
      "Online Usernames",
      "Job Information",
      "Email or Phone Numbers",
      "Public Connections",
    ],
  },
  {
    title: "Scanning Online Posts",
    items: [
      "Personal Blog Posts",
      "User Comments",
      "Forgotten Pictures",
      "Public Profiles",
      "Public Videos",
      "Active or Inactive Accounts",
    ],
  },
  {
    title: "Scanning App Activity",
    items: [
      "Account History",
      "Current or Past Profiles",
      "Saved Preferences",
      "Archived Photos or Videos",
      "Linked Contacts",
      "Recent Comments",
    ],
  },
  {
    title: "Searching Chat Apps",
    items: [
      "Account History",
      "Chat Groups",
      "Images",
      "Linked Accounts",
      "Contacts",
      "Aliases",
    ],
  },
  {
    title: "Searching Social Media",
    items: [
      "Online Activity",
      "Online Interests",
      "Recent Photos and Videos",
      "Forgotten Blog Posts",
      "Membership or Affiliation",
      "Frequent Contacts",
    ],
  },
  {
    title: "Success! Data Found.",
    items: [
      "Names Used",
      "Emails",
      "Addresses",
      "Phone Numbers",
      "Images",
      "Usernames",
      "Relationships",
      "Social Profiles",
    ],
  },
];

const EMAIL_SECTIONS: Section[] = [
  {
    title: "Collecting Data",
    items: [
      "Owner Name",
      "Alternate Emails",
      "Linked Phones",
      "Home Address",
      "Business Address",
      "Social Handles",
    ],
  },
  {
    title: "Scanning Data Breaches",
    items: [
      "Breach Databases",
      "Leaked Passwords",
      "Forum Leaks",
      "Combolists",
      "Dark Web Sources",
      "Marketplace Listings",
    ],
  },
  {
    title: "Searching Dating Apps",
    items: [
      "Tinder",
      "Bumble",
      "Hinge",
      "OkCupid",
      "Match.com",
      "Ashley Madison",
    ],
  },
  {
    title: "Searching Social Media",
    items: [
      "Facebook",
      "Instagram",
      "LinkedIn",
      "X (Twitter)",
      "Snapchat",
      "TikTok",
    ],
  },
  {
    title: "Success! Data Found.",
    items: [
      "Owner Name",
      "Linked Phones",
      "Addresses",
      "Social Profiles",
      "Dating App Presence",
      "Public Photos",
      "Breach Exposure",
      "Aliases",
    ],
  },
];

// Per-item delay BEFORE that item ticks (from start of section), then holdMs
// keeps every item visibly checked before moving on. Numbers hand-tuned so the
// scan feels alive — some items snap in fast, then a beat where nothing moves,
// then a small cluster, then a dramatic pause on the sensitive sections.
type SectionSchedule = {
  itemDelaysMs: number[];
  holdMs: number;
};

const PHONE_SCHEDULE: SectionSchedule[] = [
  // s1 — Collecting Data: fast opening burst
  { itemDelaysMs: [220, 200, 280, 240, 200, 260], holdMs: 500 },
  // s2 — Scanning Online Posts: cluster, then a mid-section pause
  { itemDelaysMs: [260, 240, 900, 280, 260, 340], holdMs: 600 },
  // s3 — Scanning App Activity: slower, small pause in the middle
  { itemDelaysMs: [340, 300, 380, 950, 300, 340], holdMs: 700 },
  // s4 — Searching Chat Apps: biggest pause, tension beat
  { itemDelaysMs: [320, 280, 340, 1200, 260, 340], holdMs: 700 },
  // s5 — Searching Social Media: medium with a short breath
  { itemDelaysMs: [280, 260, 700, 240, 260, 320], holdMs: 500 },
  // s6 — Success!: fast payoff burst
  { itemDelaysMs: [220, 200, 240, 220, 200, 240, 220, 300], holdMs: 900 },
];

const EMAIL_SCHEDULE: SectionSchedule[] = [
  // s1 — Collecting Data
  { itemDelaysMs: [220, 240, 260, 220, 260, 300], holdMs: 500 },
  // s2 — Scanning Data Breaches: big mid-pause (dramatic)
  { itemDelaysMs: [280, 300, 1100, 260, 280, 340], holdMs: 700 },
  // s3 — Searching Dating Apps: biggest pause for tension
  { itemDelaysMs: [340, 280, 340, 1400, 280, 340], holdMs: 800 },
  // s4 — Searching Social Media
  { itemDelaysMs: [280, 260, 700, 240, 260, 320], holdMs: 500 },
  // s5 — Success!
  { itemDelaysMs: [220, 200, 240, 220, 200, 240, 220, 300], holdMs: 900 },
];

// Bar beats: [elapsedMs, targetPercent]. Two consecutive beats at the same
// percent create a visible plateau (the bar stalls). Aligned with the
// SCHEDULE above so the bar visibly pauses when the item scanner pauses.
const PHONE_BAR_BEATS: Array<[number, number]> = [
  [0, 2],
  [1400, 14],   // s1 items done
  [1900, 14],   // s1 hold plateau
  [2400, 20],   // s2 beginning
  [3300, 20],   // s2's 900ms pause plateau
  [4180, 30],   // s2 items done
  [4780, 30],   // s2 hold plateau
  [6100, 40],   // s3 mid-progress
  [7050, 40],   // s3's 950ms pause plateau
  [7390, 48],   // s3 done
  [8090, 48],   // s3 hold plateau
  [9750, 58],   // s4 mid
  [10950, 58],  // s4's 1200ms dramatic pause plateau
  [11530, 68],  // s4 done
  [12230, 68],  // s4 hold plateau
  [12990, 74],  // s5 mid
  [13690, 74],  // s5's 700ms pause plateau
  [14290, 82],  // s5 done
  [14790, 82],  // s5 hold plateau
  [16630, 99],  // s6 payoff burst
];

const EMAIL_BAR_BEATS: Array<[number, number]> = [
  [0, 2],
  [1520, 15],
  [2020, 15],
  [2600, 22],
  [3700, 22],  // s2 1100ms breach pause
  [4820, 33],
  [5520, 33],
  [7000, 45],
  [8400, 45],  // s3 1400ms dating drama pause
  [8980, 58],
  [9780, 58],
  [11040, 72],
  [11540, 72],
  [13380, 99],
];

function interpolateBeats(beats: Array<[number, number]>, elapsed: number): number {
  if (elapsed <= beats[0][0]) return beats[0][1];
  const last = beats[beats.length - 1];
  if (elapsed >= last[0]) return last[1];
  for (let i = 0; i < beats.length - 1; i++) {
    const [t0, p0] = beats[i];
    const [t1, p1] = beats[i + 1];
    if (elapsed >= t0 && elapsed <= t1) {
      const t = t1 === t0 ? 1 : (elapsed - t0) / (t1 - t0);
      return p0 + t * (p1 - p0);
    }
  }
  return last[1];
}

export function Stage2OwnerInfo({
  kind,
  query,
  onDone,
}: {
  kind: "phone" | "email";
  query: string;
  onDone: () => void;
}) {
  const sections = kind === "phone" ? PHONE_SECTIONS : EMAIL_SECTIONS;
  const schedule = kind === "phone" ? PHONE_SCHEDULE : EMAIL_SCHEDULE;
  const barBeats = kind === "phone" ? PHONE_BAR_BEATS : EMAIL_BAR_BEATS;

  const [sectionIdx, setSectionIdx] = useState(0);
  const [itemsDone, setItemsDone] = useState<Record<number, Set<number>>>({});
  const [percent, setPercent] = useState(2);

  useEffect(() => {
    let cancelled = false;
    let s = 0;
    let i = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timeouts.push(t);
    };

    function tickNext() {
      if (cancelled) return;
      const items = sections[s].items;
      setItemsDone((prev) => {
        const next = { ...prev };
        const set = new Set(next[s] ?? []);
        set.add(orderIndex(i, items.length));
        next[s] = set;
        return next;
      });
      i += 1;
      if (i >= items.length) {
        // hold on the fully-checked section so every tick registers,
        // then swap to the next section
        later(() => {
          if (cancelled) return;
          s += 1;
          i = 0;
          if (s >= schedule.length) {
            later(() => !cancelled && onDone(), 900);
            return;
          }
          setSectionIdx(s);
          later(tickNext, schedule[s].itemDelaysMs[0]);
        }, schedule[s].holdMs);
      } else {
        later(tickNext, schedule[s].itemDelaysMs[i]);
      }
    }
    // initial breath so the section header lands before ticking begins
    later(tickNext, 450 + schedule[0].itemDelaysMs[0]);

    // Independent rAF loop drives the bar via the hand-crafted beat curve.
    // Because the beats have plateau segments, the bar physically pauses and
    // then jumps rather than climbing at a constant rate.
    const start = performance.now();
    const endMs = barBeats[barBeats.length - 1][0] + 400;
    let raf = 0;
    function loop(now: number) {
      if (cancelled) return;
      const elapsed = now - start;
      setPercent(interpolateBeats(barBeats, elapsed));
      if (elapsed < endMs) raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const section = sections[sectionIdx];
  const doneSet = itemsDone[sectionIdx] ?? new Set<number>();
  const isSuccess = section.title.startsWith("Success");

  return (
    <section className="mx-auto max-w-md px-5 py-8 sm:px-6">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-600" />
        {kind === "phone" ? "Phone owner" : "Email owner"} won&apos;t be notified
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
        Retrieving Owner Information for
      </h1>

      <div className="mt-3 flex items-center gap-4">
        <CyclingAvatar />
        <div className="min-w-0 flex-1">
          <div className="truncate text-2xl font-extrabold text-ink-900">
            {formatQuery(kind, query)}
          </div>
          <div className="mt-2">
            <StripedProgressBar percent={percent} height={18} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-500">
        Please be patient while we search billions of records. Your search is
        private and secure.
      </p>

      <hr className="my-5 border-ink-900/5" />

      <div key={sectionIdx} className="animate-fade-in">
        <h2 className="text-xl font-extrabold tracking-tight text-ink-900">
          {section.title}
          {isSuccess ? "" : "…"}
        </h2>

        <ul className="mt-4 space-y-3">
          {section.items.map((item, i) => {
            const done = doneSet.has(i);
            return (
              <li key={item} className="flex items-center gap-3">
                {done ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center animate-fade-in">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-brand-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                ) : (
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-[2.5px] border-brand-600/20 border-t-brand-600" />
                )}
                <span
                  className={`text-lg transition-colors ${done ? "text-ink-900" : "text-ink-500"}`}
                >
                  {item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// Slight shuffle so items don't check strictly top-to-bottom
function orderIndex(step: number, total: number): number {
  const perm = [0, 2, 4, 1, 5, 3, 6, 7];
  const p = perm[step] ?? step;
  return p % total;
}

function formatQuery(kind: "phone" | "email", q: string) {
  if (kind === "phone") {
    const digits = q.replace(/[^\d]/g, "");
    return digits.length > 10 ? digits.slice(-9).replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4") : q;
  }
  return q;
}
