import { SearchInput } from "@/components/SearchInput";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Reverse Email Lookup — ${brand.name}`,
  description:
    "Find the owner and linked profiles behind any email address.",
};

export default function EmailSearchPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          Reverse email lookup
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Who owns this email?
        </h1>
        <p className="mt-3 text-lg text-ink-500">
          Enter an email address. See the owner, linked profiles, and breach history.
        </p>
        <div className="mt-8">
          <SearchInput kind="email" autoFocus />
        </div>
      </div>
    </section>
  );
}
