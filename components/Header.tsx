import Link from "next/link";
import { brand } from "@/lib/brand";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-ink-900/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight">{brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/reverse-phone-lookup" className="text-sm text-ink-700 hover:text-ink-900">
            Phone
          </Link>
          <Link href="/reverse-email-lookup" className="text-sm text-ink-700 hover:text-ink-900">
            Email
          </Link>
          <Link href="/pricing" className="text-sm text-ink-700 hover:text-ink-900">
            Pricing
          </Link>
          <Link href="/faq" className="text-sm text-ink-700 hover:text-ink-900">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-ink-700 hover:text-ink-900 sm:inline"
          >
            Log in
          </Link>
          <Link
            href="/reverse-phone-lookup"
            className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Search now
          </Link>
        </div>
      </div>
    </header>
  );
}
