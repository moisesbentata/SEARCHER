import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

export type PhoneLookupResult = {
  input: string;
  valid: boolean;
  e164?: string;
  national?: string;
  international?: string;
  countryCode?: string;
  country?: string;
  region?: string;
  type?: string;
  carrierHint?: string;
  // Real carrier name resolved server-side (NumVerify / AbstractAPI /
  // fallback country hint). Undefined if the API returned nothing.
  carrier?: string;
  carrierSource?: "numverify" | "abstractapi" | "prefix-table" | "unknown";
  timezoneHint?: string[];
  citiesHint?: string[];
};

const COUNTRY_NAMES: Record<string, string> = {
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
  PE: "Peru",
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

// Rough NANP area code → region/city mapping (a small illustrative subset).
// This is a hint layer, not authoritative. Anything not listed falls back to
// "Unknown region within <country>".
const NANP_AREA: Record<string, { state: string; cities: string[] }> = {
  "212": { state: "New York", cities: ["New York City (Manhattan)"] },
  "213": { state: "California", cities: ["Los Angeles"] },
  "310": { state: "California", cities: ["Los Angeles (West Side)"] },
  "312": { state: "Illinois", cities: ["Chicago"] },
  "323": { state: "California", cities: ["Los Angeles"] },
  "415": { state: "California", cities: ["San Francisco"] },
  "617": { state: "Massachusetts", cities: ["Boston"] },
  "646": { state: "New York", cities: ["New York City"] },
  "702": { state: "Nevada", cities: ["Las Vegas"] },
  "718": { state: "New York", cities: ["Brooklyn, Queens, Bronx"] },
  "737": { state: "Texas", cities: ["Austin"] },
  "786": { state: "Florida", cities: ["Miami"] },
  "832": { state: "Texas", cities: ["Houston"] },
  "917": { state: "New York", cities: ["New York City"] },
  "929": { state: "New York", cities: ["New York City"] },
  "305": { state: "Florida", cities: ["Miami"] },
  "404": { state: "Georgia", cities: ["Atlanta"] },
  "469": { state: "Texas", cities: ["Dallas"] },
  "512": { state: "Texas", cities: ["Austin"] },
  "602": { state: "Arizona", cities: ["Phoenix"] },
  "708": { state: "Illinois", cities: ["Chicago (Southwest suburbs)"] },
  "713": { state: "Texas", cities: ["Houston"] },
  "720": { state: "Colorado", cities: ["Denver"] },
  "725": { state: "Nevada", cities: ["Las Vegas"] },
  "747": { state: "California", cities: ["Los Angeles (San Fernando Valley)"] },
  "770": { state: "Georgia", cities: ["Atlanta (suburbs)"] },
  "773": { state: "Illinois", cities: ["Chicago"] },
  "818": { state: "California", cities: ["Los Angeles (San Fernando Valley)"] },
  "857": { state: "Massachusetts", cities: ["Boston"] },
  "872": { state: "Illinois", cities: ["Chicago"] },
  "914": { state: "New York", cities: ["Westchester County"] },
  "916": { state: "California", cities: ["Sacramento"] },
  "980": { state: "North Carolina", cities: ["Charlotte"] },
  "202": { state: "District of Columbia", cities: ["Washington, D.C."] },
  "215": { state: "Pennsylvania", cities: ["Philadelphia"] },
  "267": { state: "Pennsylvania", cities: ["Philadelphia"] },
  "216": { state: "Ohio", cities: ["Cleveland"] },
  "313": { state: "Michigan", cities: ["Detroit"] },
  "412": { state: "Pennsylvania", cities: ["Pittsburgh"] },
  "504": { state: "Louisiana", cities: ["New Orleans"] },
  "601": { state: "Mississippi", cities: ["Jackson"] },
  "615": { state: "Tennessee", cities: ["Nashville"] },
  "808": { state: "Hawaii", cities: ["Honolulu"] },
  "907": { state: "Alaska", cities: ["Anchorage"] },
  // Canada
  "416": { state: "Ontario", cities: ["Toronto"] },
  "437": { state: "Ontario", cities: ["Toronto"] },
  "604": { state: "British Columbia", cities: ["Vancouver"] },
  "514": { state: "Quebec", cities: ["Montreal"] },
  "403": { state: "Alberta", cities: ["Calgary"] },
  "780": { state: "Alberta", cities: ["Edmonton"] },
};

const UK_AREA: Record<string, { state: string; cities: string[] }> = {
  "20": { state: "England", cities: ["London"] },
  "121": { state: "England", cities: ["Birmingham"] },
  "131": { state: "Scotland", cities: ["Edinburgh"] },
  "141": { state: "Scotland", cities: ["Glasgow"] },
  "151": { state: "England", cities: ["Liverpool"] },
  "161": { state: "England", cities: ["Manchester"] },
  "191": { state: "England", cities: ["Newcastle"] },
  "28": { state: "Northern Ireland", cities: ["Belfast"] },
  "29": { state: "Wales", cities: ["Cardiff"] },
};

function labelCarrierHint(type?: string): string | undefined {
  switch (type) {
    case "MOBILE":
      return "Mobile carrier (cellular)";
    case "FIXED_LINE":
      return "Landline (fixed line)";
    case "FIXED_LINE_OR_MOBILE":
      return "Landline or mobile";
    case "TOLL_FREE":
      return "Toll-free service";
    case "PREMIUM_RATE":
      return "Premium rate";
    case "SHARED_COST":
      return "Shared cost line";
    case "VOIP":
      return "VoIP (internet-based)";
    case "PERSONAL_NUMBER":
      return "Personal / follow-me number";
    case "PAGER":
      return "Pager";
    case "UAN":
      return "Universal access number";
    case "VOICEMAIL":
      return "Voicemail-only";
    default:
      return undefined;
  }
}

export function lookupPhone(input: string, defaultCountry?: CountryCode): PhoneLookupResult {
  const trimmed = (input || "").trim();
  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry ?? undefined);

  if (!parsed || !parsed.isValid()) {
    return { input: trimmed, valid: false };
  }

  const country = parsed.country;
  const type = parsed.getType();
  const result: PhoneLookupResult = {
    input: trimmed,
    valid: true,
    e164: parsed.number,
    national: parsed.formatNational(),
    international: parsed.formatInternational(),
    countryCode: country,
    country: country ? COUNTRY_NAMES[country] ?? country : undefined,
    type,
    carrierHint: labelCarrierHint(type),
  };

  // NANP (US/CA) region hint
  if (country === "US" || country === "CA") {
    const digits = parsed.nationalNumber;
    const area = digits.slice(0, 3);
    const hit = NANP_AREA[area];
    if (hit) {
      result.region = hit.state;
      result.citiesHint = hit.cities;
    }
  } else if (country === "GB") {
    const digits = parsed.nationalNumber;
    for (const prefix of Object.keys(UK_AREA).sort((a, b) => b.length - a.length)) {
      if (digits.startsWith(prefix)) {
        result.region = UK_AREA[prefix].state;
        result.citiesHint = UK_AREA[prefix].cities;
        break;
      }
    }
  }

  return result;
}

export function supportedCountries(): { code: string; name: string; dial: string }[] {
  return getCountries()
    .map((code) => ({
      code,
      name: COUNTRY_NAMES[code] ?? code,
      dial: "+" + getCountryCallingCode(code as CountryCode),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
