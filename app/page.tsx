import Link from "next/link";
import { brand } from "@/lib/brand";
import { SearchInput } from "@/components/SearchInput";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-80 w-[80rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/80 px-3 py-1 text-xs font-medium text-ink-700 shadow-sm backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live lookups running now
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl md:text-6xl">
              See who&apos;s really <br className="hidden sm:block" />
              on the other end.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">
              Instantly identify unknown phone numbers and email addresses.
              Fast, accurate, and discreet.
            </p>

            <div className="mt-8">
              <SearchInput kind="phone" autoFocus />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Works in 200+ countries
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                No signup to preview
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                100% anonymous
              </span>
            </div>

            <div className="mt-6 flex justify-center gap-3 text-sm">
              <Link href="/reverse-phone-lookup" className="rounded-full bg-white px-4 py-2 font-medium text-ink-700 ring-1 ring-ink-900/10 hover:bg-ink-900/5">
                Phone lookup
              </Link>
              <Link href="/reverse-email-lookup" className="rounded-full bg-white px-4 py-2 font-medium text-ink-700 ring-1 ring-ink-900/10 hover:bg-ink-900/5">
                Email lookup
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-ink-900/5 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          <Feature
            title="Instant identification"
            body="Our engine parses numbers and emails against a global index in under 2 seconds."
            icon="bolt"
          />
          <Feature
            title="Public records + open data"
            body="We combine phone metadata, breach data, business filings, and open web signals."
            icon="records"
          />
          <Feature
            title="Discreet by design"
            body={`${brand.name} never notifies the person you look up. Your search stays private.`}
            icon="lock"
          />
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Why people use {brand.name}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-ink-500">
          Real reasons real people search — no judgement, no notification.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <UseCase title="Suspect infidelity" body="See if a number or email is linked to dating apps or hidden profiles." />
          <UseCase title="Unknown callers" body="Find out who&apos;s behind that missed call before you call back." />
          <UseCase title="Online dating" body="Verify a match&apos;s identity before you meet up in person." />
          <UseCase title="Scam & spam checks" body="Cross-check against 12M+ community-reported scam numbers." />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-900/5 bg-ink-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to find out?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-300">
            Start with a phone number or email. See what we know before you pay.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/reverse-phone-lookup" className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-400">
              Search a phone number
            </Link>
            <Link href="/reverse-email-lookup" className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20">
              Search an email
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({ title, body, icon }: { title: string; body: string; icon: "bolt" | "records" | "lock" }) {
  const paths: Record<string, React.ReactNode> = {
    bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
    records: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
  };
  return (
    <div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          {paths[icon]}
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{body}</p>
    </div>
  );
}

function UseCase({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500" dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
