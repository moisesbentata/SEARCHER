import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

const NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  AU: "Australia",
  NZ: "New Zealand",
  IE: "Ireland",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  BE: "Belgium",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  CH: "Switzerland",
  AT: "Austria",
  PT: "Portugal",
  PL: "Poland",
  RU: "Russia",
  UA: "Ukraine",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  ID: "Indonesia",
  PH: "Philippines",
  TH: "Thailand",
  VN: "Vietnam",
  MY: "Malaysia",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  IL: "Israel",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  TR: "Turkey",
  EG: "Egypt",
  ZA: "South Africa",
  NG: "Nigeria",
  KE: "Kenya",
};

export type CountryEntry = {
  code: string;
  name: string;
  dial: string;
  flag: string;
};

// Emoji flag from ISO 3166 alpha-2 code.
export function flag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  const base = 0x1f1e6;
  const A = "A".charCodeAt(0);
  return String.fromCodePoint(
    base + code.charCodeAt(0) - A,
    base + code.charCodeAt(1) - A,
  );
}

const TOP_ORDER = [
  "US", "CA", "GB", "AU", "IE", "NZ",
  "ES", "FR", "DE", "IT", "PT", "NL", "BE", "CH", "AT",
  "SE", "NO", "DK", "FI",
  "MX", "BR", "AR", "CL", "CO",
  "JP", "KR", "CN", "IN", "PH", "SG", "MY", "TH", "ID", "VN", "HK", "TW",
  "IL", "AE", "SA", "TR", "EG", "ZA", "NG", "KE",
];

export function countryList(): CountryEntry[] {
  const seen = new Set<string>();
  const list: CountryEntry[] = [];

  const push = (code: string) => {
    if (seen.has(code)) return;
    seen.add(code);
    try {
      list.push({
        code,
        name: NAMES[code] ?? code,
        dial: "+" + getCountryCallingCode(code as CountryCode),
        flag: flag(code),
      });
    } catch {
      // skip unsupported codes
    }
  };

  for (const code of TOP_ORDER) push(code);
  for (const code of getCountries()) push(code);
  return list;
}

export function countryEntry(code: string): CountryEntry | undefined {
  try {
    return {
      code,
      name: NAMES[code] ?? code,
      dial: "+" + getCountryCallingCode(code as CountryCode),
      flag: flag(code),
    };
  } catch {
    return undefined;
  }
}
