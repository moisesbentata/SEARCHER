import Link from "next/link";
import { SearchEntry } from "@/components/SearchEntry";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `${brand.name} — Reverse Phone Lookup`,
  description:
    "Identify unknown callers and find the information connected to any phone number, using publicly available data from trusted sources.",
};

export default function HomePage() {
  return (
    <>
      <SearchEntry
        kind="phone"
        title="Reverse Phone"
        titleHighlight="Lookup"
        subtitle="Identify unknown callers and find the information connected to any phone number, using publicly available data from trusted sources."
      />

      {/* Featured on */}
      <FeaturedOn />

      {/* Everything You Can Uncover */}
      <UncoverSection />

      {/* Stats block: You're Not Overthinking */}
      <StatsVerifying />

      {/* Worldwide Data Coverage */}
      <WorldwideCoverage />

      {/* Why People Choose */}
      <WhyPeopleChoose />

      {/* Additional Use Cases */}
      <UseCases />

      {/* Where Data Comes From */}
      <DataSources />

      {/* Accuracy stats */}
      <AccuracyBlock />

      {/* FAQ */}
      <FAQ />

      {/* Bottom CTA */}
      <BottomCta />
    </>
  );
}

function FeaturedOn() {
  return (
    <section className="border-y border-ink-900/5 bg-ink-900/[0.02]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-ink-500">
          {brand.name} has been featured on
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-around gap-x-6 gap-y-4 text-lg font-black uppercase tracking-wider text-ink-400">
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

function UncoverSection() {
  const groups: { heading: string; items: { title: string; body: string }[] }[] = [
    {
      heading: "Phone Information",
      items: [
        { title: "Full Name", body: "Connect phone numbers, emails, and photos to the names behind them." },
        { title: "Email Addresses", body: "Match phone numbers and names to publicly listed email addresses and vice versa." },
        { title: "Home Address", body: "Uncover possible current and historical addresses linked to a person or contact." },
      ],
    },
    {
      heading: "Owner Information",
      items: [
        { title: "Family Members", body: "Identify relatives and household connections pulled from public records." },
        { title: "Past Locations", body: "See possible past locations and previously associated regions from public records. No live location tracking." },
        { title: "Professional Background", body: "See publicly listed professional details that may be tied to a contact." },
      ],
    },
    {
      heading: "Online Profiles",
      items: [
        { title: "Social Media Profiles", body: "Find public profiles across major platforms linked to a phone, email, or image." },
        { title: "Dating Profiles", body: "Spot publicly available dating profiles linked to a phone number, email, or photo." },
        { title: "Usernames & Handles", body: "Find public usernames that may connect the same contact across platforms." },
      ],
    },
    {
      heading: "Possible Risk Indicators",
      items: [
        { title: "Web Activity", body: "See public mentions from directories, blogs, forums, and news sources." },
        { title: "Spam & Complaint Reports", body: "Check whether the number appears in public spam, robocall, or fraud-complaint sources." },
        { title: "Data Breach Exposure", body: "See whether the number or a linked email appears in known public data-breach indexes." },
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
        Everything You Can Uncover <span className="text-brand-700">with {brand.name}</span>
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-ink-500">
        Whether you&apos;re identifying a caller, verifying a match, checking a seller, or running a
        vehicle history, {brand.name} surfaces the public information you need. Results vary by
        lookup type and available data sources.
      </p>

      <div className="mt-12 space-y-12">
        {groups.map((group) => (
          <div key={group.heading}>
            <div className="mb-5 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-700">
                {group.heading}
              </span>
              <span className="h-px flex-1 bg-ink-900/10" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {group.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm"
                >
                  <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-brand-100 text-brand-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-ink-500">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsVerifying() {
  const stats: [string, string][] = [
    ["90%", "of late night calls are considered a red flag"],
    ["6/10", "of lookups reveal details people weren't aware of"],
    ["52%", "say unexplained calls can create doubt in a relationship"],
    ["$1.3B+", "is lost annually to phone-related scams"],
  ];
  return (
    <section className="bg-brand-900 text-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          You&apos;re Not Overthinking, <br />
          <span className="text-brand-300">You&apos;re Verifying</span>
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([n, label]) => (
            <div key={n} className="text-center">
              <div className="text-4xl font-black tracking-tight text-brand-300 sm:text-5xl">{n}</div>
              <p className="mt-2 text-sm text-brand-100/80">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorldwideCoverage() {
  const stats: [string, string][] = [
    ["3M+", "searches in Spain in the last year"],
    ["17+", "data points in a typical phone report"],
    ["97.5%", "of reports return at least one data point"],
    ["190+", `countries where ${brand.name} is used`],
  ];
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
        Worldwide <span className="text-brand-700">Data Coverage</span>
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-ink-500">
        Access comprehensive phone data across all major regions worldwide.
      </p>
      <p className="mx-auto mt-1 max-w-xl text-center text-xs text-ink-400">
        *Coverage indicates that at least one data point was found for the searched phone number,
        based on searches performed in 2025.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([n, label]) => (
          <div
            key={n}
            className="rounded-2xl border border-ink-900/5 bg-white p-6 text-center shadow-sm"
          >
            <div className="text-3xl font-black tracking-tight text-brand-700 sm:text-4xl">{n}</div>
            <p className="mt-2 text-sm text-ink-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

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
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Why People Choose <span className="text-brand-700">{brand.name}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-500">
          Most first interactions today happen through a phone, inbox, or screen. Knowing who
          you&apos;re really talking to protects your time, money, and safety. {brand.name} gives you
          that clarity in seconds.
        </p>
        <ol className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
          {points.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-4 rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm text-ink-700">{p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    "Verify buyers and sellers on marketplaces, classifieds, and peer-to-peer platforms.",
    "Check out potential roommates before sharing space.",
    "Identify the source of harassing calls, emails, or messages.",
    "Verify other parents, coaches, or caregivers in your child's life.",
    "Check dating profiles and photos to avoid catfishing and impersonation.",
  ];
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-700">Extras</div>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
        Additional Use Cases
      </h2>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
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
            <span className="text-sm text-ink-700">{c}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

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
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Where <span className="text-brand-700">{brand.name}</span> Data Comes From
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-500">
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

function AccuracyBlock() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
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
    </section>
  );
}

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
    <section className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
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
    </section>
  );
}

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
