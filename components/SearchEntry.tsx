"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AsYouType, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { countryList, countryEntry } from "@/lib/countries";
import { HeroIllustration } from "@/components/HeroIllustration";

// Format a raw national number string using libphonenumber-js's AsYouType,
// keyed to the currently-selected country so the spacing follows local rules
// (e.g. "612 34 56 78" for Spain, "(415) 555-0134" for the US).
function formatNational(digits: string, cc: string): string {
  if (!digits) return "";
  const ay = new AsYouType(cc as CountryCode);
  return ay.input(digits);
}

type Kind = "phone" | "email" | "photo" | "vehicle" | "people";

const TABS: { key: Kind; label: string; href: string; available: boolean }[] = [
  { key: "phone", label: "Phone", href: "/reverse-phone-lookup", available: true },
  { key: "email", label: "Email", href: "/reverse-email-lookup", available: true },
  { key: "photo", label: "Photo", href: "/reverse-image-lookup", available: false },
  { key: "vehicle", label: "Vehicle", href: "/vin-lookup", available: false },
  { key: "people", label: "People", href: "/people-lookup", available: false },
];

export function SearchEntry({
  kind,
  title,
  titleHighlight,
  subtitle,
}: {
  kind: Kind;
  title: string;
  titleHighlight: string;
  subtitle: string;
}) {
  const router = useRouter();
  const countries = useMemo(() => countryList(), []);
  const [countryCode, setCountryCode] = useState("US");
  const [value, setValue] = useState(kind === "phone" ? "+1 " : "");
  const [submitting, setSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const country = countryEntry(countryCode)!;

  // When the user picks a country from the dropdown, reset the input to that
  // country's +CC prefix so they can start typing digits right after.
  function selectCountry(cc: string) {
    const entry = countryEntry(cc);
    if (!entry) return;
    setCountryCode(cc);
    setValue(entry.dial + " ");
    setCountryOpen(false);
    setCountryQuery("");
    inputRef.current?.focus();
  }

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q),
    );
  }, [countries, countryQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    const params = new URLSearchParams({ q: trimmed });
    if (kind === "phone") params.set("cc", countryCode);
    router.push(`/results/${kind}?${params.toString()}`);
  }

  return (
    <section className="mx-auto max-w-6xl px-5 pt-10 pb-14 sm:px-6 lg:pt-16 lg:pb-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="mx-auto w-full max-w-lg lg:mx-0">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-left lg:text-6xl">
        {title}
        <br />
        <span className="text-brand-700">{titleHighlight}</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-center text-base text-ink-500 lg:mx-0 lg:text-left lg:text-lg">
        {subtitle}
      </p>

      {/* Category tab bar */}
      <div className="mt-8 flex items-center justify-between gap-1 border-b border-ink-900/10 text-sm">
        {TABS.map((t) => {
          const active = t.key === kind;
          const content = (
            <span
              className={`relative block px-3 pb-2 font-semibold transition ${
                active ? "text-accent-600" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {t.label}
              {active ? (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-accent-600" />
              ) : null}
            </span>
          );
          return t.available ? (
            <Link key={t.key} href={t.href} className="flex-1 text-center">
              {content}
            </Link>
          ) : (
            <span
              key={t.key}
              className="flex-1 cursor-not-allowed text-center opacity-60"
              title="Coming soon"
            >
              {content}
            </span>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        {kind === "phone" ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setCountryOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl bg-ink-900/[0.04] px-4 py-4 text-left ring-1 ring-inset ring-ink-900/5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-haspopup="listbox"
              aria-expanded={countryOpen}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl leading-none">{country.flag}</span>
                <span className="text-base font-medium text-ink-900">
                  {country.name}
                </span>
              </span>
              <span className="flex items-center gap-2 text-ink-400">
                <span className="text-sm">{country.dial}</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>

            {countryOpen ? (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-2xl">
                <div className="border-b border-ink-900/5 p-2">
                  <input
                    autoFocus
                    placeholder="Search country…"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    className="w-full rounded-lg bg-ink-900/[0.04] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
                  {filteredCountries.map((c) => (
                    <li key={c.code}>
                      <button
                        type="button"
                        onClick={() => selectCountry(c.code)}
                        className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-ink-900/[0.04] ${
                          c.code === countryCode ? "bg-brand-50 text-brand-800" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{c.flag}</span>
                          <span className="font-medium">{c.name}</span>
                        </span>
                        <span className="text-ink-400">{c.dial}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {kind === "phone" ? (
          <PhoneInput
            inputRef={inputRef}
            country={country}
            value={value}
            onValueChange={setValue}
            onCountryChange={setCountryCode}
          />
        ) : (
          <label className="block cursor-text rounded-xl bg-ink-900/[0.04] px-4 py-3 focus-within:ring-2 focus-within:ring-brand-500">
            <span className="pointer-events-none block text-xs font-medium text-ink-500">
              Email address
            </span>
            <input
              ref={inputRef}
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="name@example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 block w-full bg-transparent text-lg font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-accent-700 active:translate-y-px disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Looking up…
            </>
          ) : (
            "Lookup"
          )}
        </button>
      </form>
        </div>

        <div className="hidden justify-center lg:flex">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

function PhoneInput({
  inputRef,
  country,
  value,
  onValueChange,
  onCountryChange,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  country: { code: string; name: string; dial: string; flag: string };
  value: string;
  onValueChange: (v: string) => void;
  onCountryChange: (cc: string) => void;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Whitelist: leading +, digits, spaces. Drop everything else so pasting
    // "call me at +44 (20) 7946-0958" reduces to "+44 20 79460958" instantly.
    let raw = e.target.value;
    // Only one leading "+" allowed; any subsequent + is stripped.
    raw = raw.replace(/[^\d+\s]/g, "");
    if (raw.startsWith("+")) {
      raw = "+" + raw.slice(1).replace(/\+/g, "");
    } else {
      raw = raw.replace(/\+/g, "");
    }

    // Format with AsYouType. If the string starts with +, it auto-detects the
    // country; if not, we fall back to formatting for the currently-selected
    // country so digits still get local spacing.
    const ay = raw.startsWith("+")
      ? new AsYouType()
      : new AsYouType(country.code as CountryCode);
    const formatted = ay.input(raw);

    // Country auto-switch: if AsYouType figured out a country from the
    // typed +CC prefix and it's different from what's currently selected,
    // update the dropdown (and thus the flag).
    const detected = ay.getCountry();
    if (detected && detected !== country.code) {
      onCountryChange(detected);
    }

    onValueChange(formatted);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Always allow navigation/editing keys and modifier-based shortcuts
    const nav = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Tab", "Enter"];
    if (nav.includes(e.key)) return;
    if (e.metaKey || e.ctrlKey) return;

    // A leading "+" is allowed at the very start of the input
    if (e.key === "+") {
      if ((inputRef.current?.selectionStart ?? 0) === 0) return;
      e.preventDefault();
      return;
    }

    // Space is allowed (formatter uses spaces to group digits)
    if (e.key === " ") return;

    // Digits only from here
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  return (
    <label className="block cursor-text rounded-xl bg-ink-900/[0.04] px-4 py-3 focus-within:ring-2 focus-within:ring-brand-500">
      <span className="pointer-events-none block text-xs font-medium text-ink-500">
        Phone Number
      </span>
      <input
        ref={inputRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={`${country.dial} ${placeholderFor(country.code)}`}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="mt-1 block w-full bg-transparent text-lg font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none"
        aria-label={`Phone number in ${country.name}`}
      />
    </label>
  );
}

function placeholderFor(cc: string): string {
  switch (cc) {
    case "US":
    case "CA":
      return "(415) 555-0134";
    case "GB":
      return "7400 123456";
    case "ES":
      return "612 34 56 78";
    case "FR":
      return "6 12 34 56 78";
    case "DE":
      return "1512 3456789";
    case "IT":
      return "312 345 6789";
    case "MX":
      return "55 1234 5678";
    case "BR":
      return "11 91234-5678";
    case "IL":
      return "50 123 4567";
    case "AU":
      return "412 345 678";
    default:
      return "612 345 678";
  }
}
