import { SearchInput } from "@/components/SearchInput";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Reverse Phone Lookup — ${brand.name}`,
  description:
    "Find the owner, carrier, and location behind any phone number in seconds.",
};

export default function PhoneSearchPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          Reverse phone lookup
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Who&apos;s behind this number?
        </h1>
        <p className="mt-3 text-lg text-ink-500">
          Enter a phone number. See the owner, carrier, and location.
        </p>
        <div className="mt-8">
          <SearchInput kind="phone" autoFocus />
        </div>
      </div>
    </section>
  );
}
