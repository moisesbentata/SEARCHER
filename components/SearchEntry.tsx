"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AsYouType, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { countryList, countryEntry, detectCountryFromPrefix } from "@/lib/countries";
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

  // On mount, upgrade the default country from the browser locale so an ES
  // user starts in ES — this matters most for autofill, which sometimes
  // inserts just the national digits (no leading "+34") and we have to pick
  // the right country for them. Runs after hydration to avoid SSR mismatch.
  useEffect(() => {
    if (kind !== "phone") return;
    if (typeof navigator === "undefined") return;
    const langTag = navigator.language || "";
    const match = langTag.match(/-([A-Z]{2})/i);
    const cc = match ? match[1].toUpperCase() : null;
    if (cc && cc !== "US") {
      const entry = countryEntry(cc);
      if (entry) {
        setCountryCode(cc);
        // Only reset value if the user hasn't already typed anything beyond
        // the default US prefix.
        setValue((prev) => (prev.trim() === "+1" || prev === "+1 " ? entry.dial + " " : prev));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
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
      setError(
        kind === "phone"
          ? "Please enter a phone number."
          : "Please enter an email address.",
      );
      inputRef.current?.focus();
      return;
    }

    if (kind === "phone") {
      if (!trimmed.startsWith("+")) {
        setError("The number must start with a country code, e.g. +1, +44, +34.");
        inputRef.current?.focus();
        return;
      }
      const parsed = parsePhoneNumberFromString(trimmed);
      if (!parsed || !parsed.isValid()) {
        setError(
          "That doesn't look like a valid phone number. Double-check the country code and digits.",
        );
        inputRef.current?.focus();
        return;
      }
    } else if (kind === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
        setError("That doesn't look like a valid email address.");
        inputRef.current?.focus();
        return;
      }
    }

    setError(null);
    setSubmitting(true);
    const params = new URLSearchParams({ q: trimmed });
    if (kind === "phone") params.set("cc", countryCode);
    router.push(`/results/${kind}?${params.toString()}`);
  }

  return (
    // overflow-x-hidden only — overflow-y must stay visible so the
    // country-picker dropdown isn't clipped by the section's bottom edge.
    <section className="relative overflow-x-clip">
      {/* Soft blue wash behind the hero — picks up the brand palette and
          echoes the reference's green blob with trust-blue instead. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 35% 40%, rgba(14,165,233,0.14) 0%, rgba(56,189,248,0.08) 40%, transparent 75%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-14 sm:px-6 lg:pt-16 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="mx-auto w-full max-w-lg lg:mx-0">
      <h1 className="text-left text-5xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
        {title}
        <br />
        <span className="bg-gradient-to-r from-brand-500 to-brand-800 bg-clip-text text-transparent">
          {titleHighlight}
        </span>
      </h1>
      <p className="mt-4 max-w-md text-left text-base text-ink-500 lg:text-lg">
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
            <div
              className={`flex items-stretch overflow-hidden rounded-xl bg-ink-900/[0.04] focus-within:ring-2 focus-within:ring-brand-500 ${
                error ? "ring-2 ring-rose-400 focus-within:ring-rose-500" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setCountryOpen((o) => !o)}
                className="flex shrink-0 items-center gap-2 px-4 py-3 text-left hover:bg-ink-900/[0.03] focus:outline-none"
                aria-haspopup="listbox"
                aria-expanded={countryOpen}
              >
                <span className="text-xl leading-none">{country.flag}</span>
                <span className="max-w-[5.5rem] truncate text-base font-medium text-ink-900 sm:max-w-[8rem]">
                  {country.name}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-ink-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className="w-px self-stretch bg-ink-900/10" />

              <PhoneInput
                inputRef={inputRef}
                country={country}
                value={value}
                onValueChange={(v) => {
                  setValue(v);
                  if (error) setError(null);
                }}
                onCountryChange={setCountryCode}
                invalid={Boolean(error)}
              />
            </div>

            {countryOpen ? (
              <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[60vh] overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-2xl">
                <div className="border-b border-ink-900/5 p-2">
                  <input
                    autoFocus
                    placeholder="Search country…"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    // text-base (16px) prevents iOS Safari from zooming in on focus.
                    className="w-full rounded-lg bg-ink-900/[0.04] px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <ul role="listbox" className="max-h-[calc(60vh-56px)] overflow-y-auto py-1">
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

        {kind === "email" ? (
          <label
            className={`block cursor-text rounded-xl bg-ink-900/[0.04] px-4 py-3 focus-within:ring-2 focus-within:ring-brand-500 ${
              error ? "ring-2 ring-rose-400 focus-within:ring-rose-500" : ""
            }`}
          >
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
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              className="mt-1 block w-full bg-transparent text-lg font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </label>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800"
          >
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}

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
  invalid,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  country: { code: string; name: string; dial: string; flag: string };
  value: string;
  onValueChange: (v: string) => void;
  onCountryChange: (cc: string) => void;
  invalid?: boolean;
}) {
  // Refs mirror the latest props so the autofill poll (set up once on
  // mount) can always see current values instead of stale closures from
  // the first render.
  const valueRef = useRef(value);
  const countryRef = useRef(country);
  useEffect(() => {
    valueRef.current = value;
    countryRef.current = country;
  });

  function processInput(rawInput: string) {
    // Whitelist: digits, +, spaces. Everything else is dropped so pasting
    // "call me at +44 (20) 7946-0958" reduces to "+44 20 7946 0958".
    let raw = rawInput.replace(/[^\d+\s]/g, "");
    // If a NEW "+" appears partway through, user wanted to restart the
    // country code — keep only from the last "+" onward.
    const lastPlus = raw.lastIndexOf("+");
    if (lastPlus > 0) raw = raw.substring(lastPlus);
    const hasExplicitPlus = raw.includes("+");
    raw = raw.replace(/\+/g, "").replace(/^\s+/, "");

    if (hasExplicitPlus) {
      // International format — the + prefix tells us which country to use.
      const international = "+" + raw;
      const detected = detectCountryFromPrefix(international);
      if (detected && detected !== countryRef.current.code) {
        onCountryChange(detected);
      }
      const cc = (detected ?? countryRef.current.code) as CountryCode;
      const ay = new AsYouType(cc);
      const formatted = ay.input(international);
      const display = formatted && formatted.startsWith("+") ? formatted : international;
      onValueChange(display);
      return;
    }

    // No "+" — treat as a national-format number inside the currently
    // selected country. This is the autofill-from-Contacts case where iOS
    // Safari sometimes inserts just the digits ("675740119") even though
    // the autofill suggestion shows "+34 675 740 119". We keep the user's
    // chosen country instead of trying to re-detect it from the leading
    // digits (which would otherwise match the wrong country code).
    const digits = raw.replace(/\s/g, "");
    if (!digits) {
      // Field cleared — leave just the country prefix as a hint.
      onValueChange(countryRef.current.dial + " ");
      return;
    }
    const dial = countryRef.current.dial; // e.g. "+34"
    const international = dial + " " + digits;
    const ay = new AsYouType(countryRef.current.code as CountryCode);
    const formatted = ay.input(international);
    const display = formatted && formatted.startsWith("+") ? formatted : international;
    onValueChange(display);
  }

  function syncFromDom() {
    const el = inputRef.current;
    if (!el) return;
    if (el.value === valueRef.current) return;
    processInput(el.value);
  }

  function pollForAutofill() {
    const start = performance.now();
    let frame = 0;
    const loop = () => {
      syncFromDom();
      if (performance.now() - start < 2500) {
        frame = requestAnimationFrame(loop);
      }
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }

  useEffect(() => {
    // Catch autofill that fires right at page load (common for password
    // managers that pre-fill as soon as the field exists).
    return pollForAutofill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    processInput(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Always allow navigation/editing keys and modifier-based shortcuts
    const nav = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Tab", "Enter"];
    if (nav.includes(e.key)) return;
    if (e.metaKey || e.ctrlKey) return;

    // "+" is always allowed — handleChange collapses stray plus signs by
    // keeping only the last one, which lets the user restart the country
    // code at any time (e.g. switch from "+1 …" to "+34 …" mid-edit).
    if (e.key === "+") return;

    // Space is allowed (formatter uses spaces to group digits)
    if (e.key === " ") return;

    // Digits only from here
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  // Note: no own box styling — this is embedded inside the shared country +
  // phone container above, so it blends into one unified input visually.
  return (
    <label className="block min-w-0 flex-1 cursor-text px-4 py-2">
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
        onFocus={pollForAutofill}
        onBlur={syncFromDom}
        className="block w-full bg-transparent text-base font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none"
        aria-label={`Phone number in ${country.name}`}
        aria-invalid={invalid ? "true" : undefined}
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
