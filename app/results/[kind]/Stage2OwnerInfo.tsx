"use client";

import { useEffect, useRef, useState } from "react";
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

const TICK_MS = 340; // pace of each item flipping to a check
const SECTION_HOLD_MS = 1100; // hold each fully-ticked section this long before swapping

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
  const [sectionIdx, setSectionIdx] = useState(0);
  const [itemsDone, setItemsDone] = useState<Record<number, Set<number>>>({});
  // percent is animated smoothly via requestAnimationFrame — not tied to item ticks
  const [percent, setPercent] = useState(2);

  // Total run time chosen so the bar reaches 99% roughly when the final
  // section finishes checking off.
  const totalRunMs = useRef(
    sections.reduce((n, s) => n + s.items.length * TICK_MS + SECTION_HOLD_MS, 0),
  );

  useEffect(() => {
    let cancelled = false;
    let s = 0;
    let i = 0;

    function tick() {
      if (cancelled) return;
      const section = sections[s];
      // check off items in a mildly randomized order
      setItemsDone((prev) => {
        const next = { ...prev };
        const set = new Set(next[s] ?? []);
        set.add(orderIndex(i, section.items.length));
        next[s] = set;
        return next;
      });
      i += 1;
      if (i >= section.items.length) {
        // hold the fully-checked section so the user actually sees every tick
        setTimeout(() => {
          if (cancelled) return;
          s += 1;
          i = 0;
          if (s >= sections.length) {
            setTimeout(() => !cancelled && onDone(), 900);
            return;
          }
          setSectionIdx(s);
          setTimeout(tick, 350); // brief breath before the new section starts
        }, SECTION_HOLD_MS);
      } else {
        setTimeout(tick, TICK_MS);
      }
    }
    // small delay so the header lands before ticking begins
    setTimeout(tick, 450);

    // Smoothly animate the percent value from 2 → 99 over the total run time.
    const start = performance.now();
    let raf = 0;
    function loop(now: number) {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / totalRunMs.current);
      // ease-out so the bar sprints early and eases at the end
      const eased = 1 - Math.pow(1 - t, 1.6);
      setPercent(Math.round(2 + eased * 97));
      if (t < 1) raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
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
                  <span
                    key="check"
                    className="inline-flex h-6 w-6 items-center justify-center animate-fade-in"
                  >
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
                <span className={`text-lg transition-colors ${done ? "text-ink-900" : "text-ink-500"}`}>
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

// Randomize check-off order lightly so items don't check top-to-bottom
function orderIndex(step: number, total: number): number {
  const perm = [0, 2, 4, 1, 5, 3, 6, 7];
  const p = perm[step] ?? step;
  return p % total;
}

function formatQuery(kind: "phone" | "email", q: string) {
  if (kind === "phone") {
    // Strip leading + and country code cluster for a shorter display
    const digits = q.replace(/[^\d]/g, "");
    return digits.length > 10 ? digits.slice(-9).replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4") : q;
  }
  return q;
}
