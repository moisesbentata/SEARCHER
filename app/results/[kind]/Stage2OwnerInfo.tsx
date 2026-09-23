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

// Per-item delay BEFORE the item ticks (from previous item, or section start).
// Sensitive/dramatic items get 3-6s waits so the scan feels like it's really
// digging. holdMs is the ~1s pause after every item is checked before the
// section swaps out.
type SectionSchedule = {
  itemDelaysMs: number[];
  holdMs: number;
};

// Phone: total ~91s (Stage 1 phone map ~9s → 100s combined). Delays climb
// toward the end of each section so the LAST-ticked item is the juicy one.
const PHONE_SCHEDULE: SectionSchedule[] = [
  // s1 — Collecting Data (11s): last tick = Forgotten Profiles
  { itemDelaysMs: [1200, 1400, 1500, 1400, 1500, 3000], holdMs: 1000 },
  // s2 — Scanning Online Posts (13s): last = Active or Inactive Accounts
  { itemDelaysMs: [1200, 1400, 1800, 1500, 2500, 3600], holdMs: 1000 },
  // s3 — Scanning App Activity (15s): last = Current or Past Profiles
  { itemDelaysMs: [1300, 1500, 2500, 1600, 3500, 3600], holdMs: 1000 },
  // s4 — Searching Chat Apps (18s): last two = Images then Linked Accounts
  { itemDelaysMs: [1400, 2000, 1500, 3200, 4400, 4500], holdMs: 1000 },
  // s5 — Searching Social Media (20s): last two = Recent Photos and Videos
  //   then Online Activity (biggest drama)
  { itemDelaysMs: [1400, 1700, 2000, 2900, 4500, 6500], holdMs: 1000 },
  // s6 — Success! Data Found (14s): last = Social Profiles
  { itemDelaysMs: [800, 900, 900, 1000, 2400, 1000, 2500, 3500], holdMs: 1000 },
];

// Email: total ~100s (no Stage 1 for email)
const EMAIL_SCHEDULE: SectionSchedule[] = [
  // s1 — Collecting Data (14s)
  { itemDelaysMs: [1500, 1500, 2200, 1700, 3600, 2500], holdMs: 1000 },
  // s2 — Scanning Data Breaches (20s): dramatic breach reveals
  { itemDelaysMs: [1600, 3800, 1800, 3500, 3800, 4500], holdMs: 1000 },
  // s3 — Searching Dating Apps (26s): the juiciest section, Ashley Madison last
  { itemDelaysMs: [2000, 3600, 4200, 3200, 4500, 7500], holdMs: 1000 },
  // s4 — Searching Social Media (22s): Snapchat + TikTok as the juicy tail
  { itemDelaysMs: [1500, 2200, 3600, 3200, 4800, 5700], holdMs: 1000 },
  // s5 — Success! Data Found (18s): escalating payoff, aliases last
  { itemDelaysMs: [1000, 1100, 1200, 1500, 2800, 2400, 3200, 3800], holdMs: 1000 },
];

// Percent value the bar sits at when each section ends (before its 1s hold).
// Chosen so the bar reaches ~99% right at the last item of Success.
const PHONE_SECTION_END_PCT = [14, 29, 47, 66, 83, 98];
const EMAIL_SECTION_END_PCT = [17, 37, 62, 82, 98];

// Tick order per section: index [i] is which item-index gets checked at
// tick step i. Ordered so the LAST tick is the juicy item the user wants
// featured, and the biggest delays in itemDelaysMs line up with those.
const PHONE_TICK_ORDER: number[][] = [
  // s1 Collecting Data — last: Forgotten Profiles (1)
  [0, 3, 5, 2, 4, 1],
  // s2 Scanning Online Posts — last: Active or Inactive Accounts (5)
  [0, 2, 4, 1, 3, 5],
  // s3 Scanning App Activity — last: Current or Past Profiles (1)
  [0, 2, 4, 3, 5, 1],
  // s4 Searching Chat Apps — last two: Images (2), Linked Accounts (3)
  [0, 1, 4, 5, 2, 3],
  // s5 Searching Social Media — last two: Recent Photos and Videos (2),
  //   Online Activity (0)
  [1, 3, 4, 5, 2, 0],
  // s6 Success! Data Found — last: Social Profiles (7)
  [0, 1, 2, 3, 5, 4, 6, 7],
];

// Email tick order: mildly shuffled but each section keeps its natural
// dramatic tail (Ashley Madison, TikTok, Aliases).
const EMAIL_TICK_ORDER: number[][] = [
  [0, 2, 4, 1, 3, 5],
  [0, 2, 4, 1, 3, 5],
  [0, 2, 1, 3, 4, 5],
  [0, 2, 1, 3, 4, 5],
  [0, 1, 2, 3, 5, 4, 6, 7],
];

// Waits >= this many ms are treated as a "juicy pause" — the bar visibly
// stalls in the middle of the wait, then resumes climbing as the item ticks.
const PLATEAU_THRESHOLD = 3500;

type Beat = [number, number]; // [elapsed ms since Stage 2 start, percent]

// Generate bar beats from a section schedule so the bar's rise mirrors the
// item scanner exactly. Long waits get a plateau segment where the bar sits
// still, then a smooth climb to the next item's target percent.
function generateBeats(
  schedule: SectionSchedule[],
  sectionEndPercents: number[],
): Beat[] {
  const beats: Beat[] = [[0, 2]];
  let time = 0;
  let percent = 2;

  schedule.forEach((section, sIdx) => {
    const targetEnd = sectionEndPercents[sIdx];
    const stepPct = (targetEnd - percent) / section.itemDelaysMs.length;

    section.itemDelaysMs.forEach((delay) => {
      if (delay >= PLATEAU_THRESHOLD) {
        // Bar climbs a bit into the wait, then plateaus for the middle of it,
        // then climbs the rest of the way as the item ticks.
        const climbInTo = time + Math.floor(delay * 0.28);
        const climbInPercent = percent + stepPct * 0.35;
        beats.push([climbInTo, climbInPercent]);
        const plateauEnd = time + Math.floor(delay * 0.78);
        beats.push([plateauEnd, climbInPercent]);
      }
      time += delay;
      percent += stepPct;
      beats.push([time, percent]);
    });

    // 1s hold: bar creeps up half a point so it's not perfectly frozen
    time += section.holdMs;
    percent = Math.min(99, targetEnd + 0.5);
    beats.push([time, percent]);
  });

  // Clamp final beat to 99
  const last = beats[beats.length - 1];
  beats[beats.length - 1] = [last[0], Math.min(99, last[1])];
  return beats;
}

const PHONE_BEATS = generateBeats(PHONE_SCHEDULE, PHONE_SECTION_END_PCT);
const EMAIL_BEATS = generateBeats(EMAIL_SCHEDULE, EMAIL_SECTION_END_PCT);

function interpolateBeats(beats: Beat[], elapsed: number): number {
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
  const beats = kind === "phone" ? PHONE_BEATS : EMAIL_BEATS;
  const tickOrder = kind === "phone" ? PHONE_TICK_ORDER : EMAIL_TICK_ORDER;

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
      const order = tickOrder[s];
      const which = order[i] ?? i;
      setItemsDone((prev) => {
        const next = { ...prev };
        const set = new Set(next[s] ?? []);
        set.add(which);
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
            later(() => !cancelled && onDone(), 700);
            return;
          }
          setSectionIdx(s);
          later(tickNext, schedule[s].itemDelaysMs[0]);
        }, schedule[s].holdMs);
      } else {
        later(tickNext, schedule[s].itemDelaysMs[i]);
      }
    }
    later(tickNext, schedule[0].itemDelaysMs[0]);

    // rAF drives the bar percent along the generated beat curve. Because the
    // bar's width is bound directly to this percent (no CSS transition), the
    // bar physically pauses when the percent plateaus.
    const start = performance.now();
    const endMs = beats[beats.length - 1][0] + 400;
    let raf = 0;
    function loop(now: number) {
      if (cancelled) return;
      const elapsed = now - start;
      setPercent(interpolateBeats(beats, elapsed));
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

function formatQuery(kind: "phone" | "email", q: string) {
  if (kind === "phone") {
    const digits = q.replace(/[^\d]/g, "");
    return digits.length > 10 ? digits.slice(-9).replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4") : q;
  }
  return q;
}
