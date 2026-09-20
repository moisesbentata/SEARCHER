"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Kind = "phone" | "email";

export function SearchInput({
  kind,
  autoFocus = false,
}: {
  kind: Kind;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [country, setCountry] = useState("US");
  const [submitting, setSubmitting] = useState(false);

  const placeholder = useMemo(
    () => (kind === "phone" ? "Enter phone number, e.g. (415) 555-0134" : "Enter email address"),
    [kind],
  );

  const disabled = value.trim().length === 0 || submitting;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    const params = new URLSearchParams({ q: value.trim() });
    if (kind === "phone") params.set("cc", country);
    router.push(`/results/${kind}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-ink-900/10 sm:flex-row sm:items-stretch"
    >
      {kind === "phone" ? (
        <div className="flex items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-3 sm:border-0 sm:pl-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-ink-400"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.34 1.88.63 2.77a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.31-1.31a2 2 0 0 1 2.11-.45c.89.29 1.82.5 2.77.63A2 2 0 0 1 22 16.92z" />
          </svg>
          <select
            aria-label="Country"
            className="appearance-none bg-transparent py-3 pr-2 text-sm text-ink-700 focus:outline-none"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="US">🇺🇸 +1 US</option>
            <option value="CA">🇨🇦 +1 CA</option>
            <option value="GB">🇬🇧 +44</option>
            <option value="AU">🇦🇺 +61</option>
            <option value="DE">🇩🇪 +49</option>
            <option value="FR">🇫🇷 +33</option>
            <option value="ES">🇪🇸 +34</option>
            <option value="IT">🇮🇹 +39</option>
            <option value="MX">🇲🇽 +52</option>
            <option value="BR">🇧🇷 +55</option>
            <option value="IL">🇮🇱 +972</option>
          </select>
        </div>
      ) : null}

      <input
        autoFocus={autoFocus}
        type={kind === "email" ? "email" : "tel"}
        inputMode={kind === "phone" ? "tel" : "email"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-w-0 flex-1 rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-base placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 sm:border-0"
      />

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Searching…
          </>
        ) : (
          <>
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
            Search
          </>
        )}
      </button>
    </form>
  );
}
