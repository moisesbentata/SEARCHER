import { brand } from "@/lib/brand";

export const metadata = { title: `FAQ — ${brand.name}` };

const items = [
  {
    q: `What is ${brand.name}?`,
    a: `${brand.name} is an information lookup service. Enter a phone number or email and we surface public metadata, breach exposure, and open signals about it.`,
  },
  {
    q: "Will the person I look up know I searched them?",
    a: `No. ${brand.name} never notifies the person you look up. Your searches are private.`,
  },
  {
    q: "How accurate are the results?",
    a: "We combine phone-numbering-plan data, breach databases, and open web signals. Number metadata and provider info are highly accurate. Owner-name matches are best-effort and depend on public data availability.",
  },
  {
    q: "How does the trial work?",
    a: `You pay $${brand.trialPrice.toFixed(0)} for ${brand.trialDurationDays} days. After that, it renews at $${brand.monthlyPrice}/month. You can cancel anytime from your account settings — one click, no phone call.`,
  },
  {
    q: "Can I use this for employment or credit decisions?",
    a: `No. ${brand.name} is not a consumer reporting agency and is not intended for use in decisions covered by the Fair Credit Reporting Act (FCRA) — that includes employment, credit, housing, insurance, and eligibility for government benefits.`,
  },
  {
    q: "How do I remove my info?",
    a: `Visit our opt-out page to request removal of your phone or email from our indexes. We honor removal requests within 30 days.`,
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
      <div className="mt-8 divide-y divide-ink-900/5 rounded-2xl border border-ink-900/5 bg-white shadow-sm">
        {items.map((item) => (
          <details key={item.q} className="group p-5">
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-ink-900">
              {item.q}
              <span className="ml-4 text-ink-400 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-ink-500">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
