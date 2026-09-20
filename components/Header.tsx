import Link from "next/link";
import { brand } from "@/lib/brand";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-ink-900/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative grid h-8 w-8 place-items-center rounded-full border-[2.5px] border-ink-900 bg-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-ink-900">
            {brand.name}
          </span>
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

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-ink-700 hover:text-ink-900 sm:inline"
          >
            Log in
          </Link>
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-700 md:hidden"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
