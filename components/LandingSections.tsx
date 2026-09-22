import Link from "next/link";
import { brand } from "@/lib/brand";
import { WorldCoverageMap } from "@/components/WorldCoverageMap";

export function LandingSections() {
  return (
    <>
      <FeaturedOn />
      <UncoverSection />
      <StatsVerifying />
      <WorldwideCoverage />
      <WhyPeopleChoose />
      <UseCases />
      <DataSources />
      <AccuracyBlock />
      <FAQ />
      <BottomCta />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Featured on                                                        */
/* ------------------------------------------------------------------ */
function FeaturedOn() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-ink-500">
          {brand.name} has been featured on
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-around gap-x-8 gap-y-5 text-lg font-black uppercase tracking-wider text-ink-400">
          <span className="italic">Entrepreneur</span>
          <span className="rounded bg-ink-900/[0.06] px-2 py-0.5 tracking-[0.35em]">WIRED</span>
          <span className="lowercase tracking-[0.15em]">msn</span>
          <span className="tracking-[0.15em]">BBC</span>
          <span className="font-serif italic tracking-widest">THE GLOBE AND MAIL</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Everything You Can Uncover — 4 BIG cards with item dividers        */
/* ------------------------------------------------------------------ */
function UncoverSection() {
  const groups: {
    heading: string;
    icon: React.ReactNode;
    items: { title: string; body: string }[];
  }[] = [
    {
      heading: "Phone Information",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.34 1.88.63 2.77a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.31-1.31a2 2 0 0 1 2.11-.45c.89.29 1.82.5 2.77.63A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      items: [
        { title: "Full Name", body: "Connect phone numbers, emails, and photos to the names behind them." },
        { title: "Email Addresses", body: "Match phone numbers and names to publicly listed email addresses and vice versa." },
        { title: "Home Address", body: "Uncover possible current and historical addresses linked to a person or contact." },
      ],
    },
    {
      heading: "Owner Information",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      ),
      items: [
        { title: "Family Members", body: "Identify relatives and household connections pulled from public records." },
        { title: "Past Locations", body: "See possible past locations and previously associated regions from public records. No live location tracking." },
        { title: "Professional Background", body: "See publicly listed professional details that may be tied to a contact." },
      ],
    },
    {
      heading: "Online Profiles",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
      ),
      items: [
        { title: "Social Media Profiles", body: "Find public profiles across major platforms linked to a phone, email, or image." },
        { title: "Dating Profiles", body: "Spot publicly available dating profiles linked to a phone number, email, or photo." },
        { title: "Usernames & Handles", body: "Find public usernames that may connect the same contact across platforms." },
      ],
    },
    {
      heading: "Possible Risk Indicators",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      items: [
        { title: "Web Activity", body: "See public mentions from directories, blogs, forums, and news sources." },
        { title: "Spam & Complaint Reports", body: "Check whether the number appears in public spam, robocall, or fraud-complaint sources." },
        { title: "Data Breach Exposure", body: "See whether the number or a linked email appears in known public data-breach indexes." },
      ],
    },
  ];

  return (
    <section className="bg-ink-900/[0.03]">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Everything You Can Uncover with {brand.name}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-ink-500">
          Whether you&apos;re identifying a caller, verifying a match, checking a seller, or running a
          vehicle history, {brand.name} surfaces the public information you need. Results vary by
          lookup type and available data sources.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.heading}
              className="rounded-3xl border border-ink-900/5 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                  {group.icon}
                </span>
                <h3 className="text-xl font-extrabold tracking-tight text-ink-900">
                  {group.heading}
                </h3>
              </div>
              <div className="mt-5 divide-y divide-ink-900/10">
                {group.items.map((item) => (
                  <div key={item.title} className="py-4 first:pt-0 last:pb-0">
                    <div className="text-lg font-bold text-ink-900">{item.title}</div>
                    <p className="mt-1 text-base text-ink-500">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* You're Not Overthinking, You're Verifying — light bg, black numbers */
/* ------------------------------------------------------------------ */
function StatsVerifying() {
  const stats: [string, string][] = [
    ["90%", "of late night calls are considered a red flag"],
    ["6/10", "of lookups reveal details people weren't aware of"],
    ["52%", "say unexplained calls can create doubt in a relationship"],
    ["$1.3B+", "is lost annually to phone-related scams"],
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          You&apos;re Not Overthinking,
          <br />
          <span className="text-brand-700">You&apos;re Verifying</span>
        </h2>
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([n, label]) => (
            <div key={n}>
              <div className="text-4xl font-black tracking-tight text-ink-900 sm:text-5xl">{n}</div>
              <p className="mt-2 max-w-[16rem] text-base text-ink-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Worldwide Data Coverage — real map + overlay + stats grid          */
/* ------------------------------------------------------------------ */
function WorldwideCoverage() {
  const stats: [string, string][] = [
    ["3M+", "searches in the last year"],
    ["17+", "data points in a typical phone report"],
    ["97.5%", "of reports return at least one data point"],
    ["190+", `countries where ${brand.name} is used`],
  ];
  return (
    <section className="bg-ink-900/[0.03]">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Worldwide Data Coverage
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">
          Access comprehensive phone data across all major regions worldwide.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-ink-900/5 bg-white p-4 shadow-sm sm:p-6">
          <WorldCoverageMap />
        </div>

        <p className="mt-3 text-center text-xs text-ink-400">
          *Coverage indicates that at least one data point was found for the searched phone
          number, based on searches performed in 2025.
        </p>

        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([n, label]) => (
            <div key={n}>
              <div className="text-4xl font-black tracking-tight text-ink-900 sm:text-5xl">{n}</div>
              <p className="mt-2 max-w-[16rem] text-base text-ink-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why People Choose — numbered cards with rainbow-ring badges         */
/* ------------------------------------------------------------------ */
function WhyPeopleChoose() {
  const points = [
    "Identify Anyone, Anywhere. Phone number, email, photo, or VIN — whatever you have, we help put a name and context behind it.",
    "Reconnect with People You've Lost Touch With. Find updated information for old friends, relatives, or former colleagues, even if their contact details have changed.",
    "Verify Online Identities Before You Trust Them. Check dating matches, online sellers, and new contacts before sharing personal information.",
    "Spot Scams, Spam, and Suspicious Activity. Suspicious call, shady email, fake profile, or questionable listing? Run a check before you engage.",
    "Monitor Your Own Digital Footprint. Search your own phone, email, or photo to see what's publicly exposed — and where.",
    "Protect Your Family Online and Offline. Vet roommates, dates, coaches, and anyone who enters your family's life.",
  ];
  return (
    <section className="bg-ink-900/[0.03]">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Why People
          <br className="sm:hidden" /> Choose <span className="text-brand-700">{brand.name}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-ink-500">
          Most first interactions today happen through a phone, inbox, or screen. Knowing who
          you&apos;re really talking to protects your time, money, and safety. {brand.name} gives you
          that clarity in seconds.
        </p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {points.map((p, i) => {
            const parts = p.split(". ");
            const head = parts[0] + ".";
            const body = parts.slice(1).join(". ");
            return (
              <li
                key={i}
                className="rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm"
              >
                <NumberBadge n={i + 1} />
                <p className="mt-4 text-base text-ink-800">
                  <strong className="font-bold">{head}</strong> {body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function NumberBadge({ n }: { n: number }) {
  // Purple → orange → yellow gradient ring, matching the reference
  return (
    <span className="relative inline-grid h-12 w-12 place-items-center text-lg font-bold text-ink-900">
      <svg viewBox="0 0 48 48" className="absolute inset-0" aria-hidden>
        <defs>
          <linearGradient id={`ring${n}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="none" stroke={`url(#ring${n})`} strokeWidth="2.5" />
      </svg>
      <span className="relative">{n}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Additional Use Cases                                                */
/* ------------------------------------------------------------------ */
function UseCases() {
  const cases = [
    "Verify buyers and sellers on marketplaces, classifieds, and peer-to-peer platforms.",
    "Check out potential roommates before sharing space.",
    "Identify the source of harassing calls, emails, or messages.",
    "Verify other parents, coaches, or caregivers in your child's life.",
    "Check dating profiles and photos to avoid catfishing and impersonation.",
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-700">Extras</div>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Additional Use Cases
        </h2>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {cases.map((c) => (
            <li
              key={c}
              className="flex items-start gap-3 rounded-xl border border-ink-900/5 bg-white p-4"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-700">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className="text-base text-ink-700">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Where Data Comes From                                               */
/* ------------------------------------------------------------------ */
function DataSources() {
  const sources = [
    {
      title: "Government and public registries",
      body: "Official records made public by law, including registry filings and court records.",
    },
    {
      title: "Public directories",
      body: "Phone directories, address and property records, and utility registrations where these are publicly available.",
    },
    {
      title: "Public social and dating profiles",
      body: "Profiles, usernames, and photos set to public on the platforms themselves.",
    },
    {
      title: "Data-breach indexes",
      body: "Public compilations of contact details exposed in known breaches.",
    },
    {
      title: "Carrier and numbering data",
      body: "Network operator, line type, and numbering-plan metadata.",
    },
    {
      title: "News, media and web archives",
      body: "Public mentions in news, blogs, forums, and directories.",
    },
  ];
  return (
    <section className="bg-ink-900/[0.03]">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Where {brand.name} Data Comes From
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-ink-500">
          {brand.name} holds no private databases and collects no device data. Each lookup checks
          the number against public and licensed sources and compiles matching records.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-bold text-ink-900">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Accuracy stats                                                       */
/* ------------------------------------------------------------------ */
function AccuracyBlock() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-500/20 bg-brand-50 p-6">
            <div className="text-4xl font-black text-brand-700">97.5% Data Accuracy</div>
            <p className="mt-2 text-sm text-brand-900/80">
              Every report is powered by public data sources. Results may vary by number.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm font-bold text-brand-900">Carrier Data</div>
                <p className="text-xs text-brand-900/70">Operator and line-type data from telecom numbering sources.</p>
              </div>
              <div>
                <div className="text-sm font-bold text-brand-900">Public Records</div>
                <p className="text-xs text-brand-900/70">Government and court records made public by law, where available.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm">
            <div className="text-4xl font-black text-ink-900">3 Billion+ Records Searched</div>
            <p className="mt-2 text-sm text-ink-500">
              Public and commercially licensed source categories searched with every lookup.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */
function FAQ() {
  const items = [
    {
      q: `What is ${brand.name}?`,
      a: `${brand.name} is a lookup platform that helps you identify the people, contacts, and items in your life using publicly available information. With four tools — phone lookup, email lookup, photo lookup, and VIN lookup — you can find the identity or history behind nearly any contact point in seconds.`,
    },
    {
      q: `How does ${brand.name} work?`,
      a: `Enter what you have — a phone number, email address, photo, or vehicle identification number — into the search widget. ${brand.name} scans public records, social media, and open-source intelligence (OSINT) from sources around the world and compiles a profile of everything linked to that input. Sign in to view the full report.`,
    },
    {
      q: `What can I look up with ${brand.name}?`,
      a: `${brand.name} offers four lookup tools. Phone lookup identifies the owner, carrier, and line type behind a phone number. Email lookup surfaces names, social profiles, and accounts tied to an email address. Photo lookup finds public profiles and web mentions of a face or image. VIN lookup decodes a vehicle identification number to reveal make, model, history, and registration details. You can use any or all of them from a single subscription.`,
    },
    {
      q: `Is ${brand.name} legitimate?`,
      a: `Yes. ${brand.name} is a legitimate subscription service. We only access and aggregate information that is already publicly available — we don't hack, track, or surveil anyone. ${brand.name} is not a consumer reporting agency and cannot be used for employment, tenant, credit, or insurance decisions governed by the Fair Credit Reporting Act (FCRA). Our results are meant to help you make informed personal decisions.`,
    },
    {
      q: `How much does ${brand.name} cost?`,
      a: `Start with a ${brand.trialDurationDays}-day trial for ${brand.currencySymbol}${brand.trialPrice.toFixed(2)}, which includes lookup credits. After the trial, your subscription renews at ${brand.currencySymbol}${brand.monthlyPrice} per ${brand.billingCycleDays} days until you cancel. One subscription gives you access to all lookup tools. You can cancel anytime with a single click.`,
    },
    {
      q: `How do I cancel my ${brand.name} subscription?`,
      a: `You can cancel any time in one click — no phone calls or emails required. Log in, go to the Cancellation Portal, and confirm. Your plan stops renewing immediately, you keep access until the end of the current billing period, and we email you a confirmation for your records.`,
    },
  ];
  return (
    <section className="bg-ink-900/[0.03]">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Frequently
          <br />
          Asked <span className="text-brand-700">Questions</span>
        </h2>
        <div className="mt-8 divide-y divide-ink-900/10 rounded-2xl border border-ink-900/5 bg-white shadow-sm">
          {items.map((item) => (
            <details key={item.q} className="group p-5">
              <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-ink-900">
                {item.q}
                <span className="ml-4 text-2xl leading-none text-ink-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-ink-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom CTA                                                            */
/* ------------------------------------------------------------------ */
function BottomCta() {
  return (
    <section className="bg-ink-900 text-white">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to find out?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-300">
          Start with a phone number or email. See what {brand.name} can uncover in under a minute.
        </p>
        <Link
          href="/reverse-phone-lookup"
          className="mt-6 inline-flex items-center rounded-xl bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-accent-400"
        >
          Run a lookup
        </Link>
      </div>
    </section>
  );
}
