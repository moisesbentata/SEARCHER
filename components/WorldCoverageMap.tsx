"use client";

import { useMemo, useState } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
// countries-110m.json ships with the public-domain "world-atlas" package
// (Natural Earth data). Country shapes are factual geographic data, not
// subject to copyright.
import topology from "world-atlas/countries-110m.json";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Feature, Geometry } from "geojson";

type Region = {
  key: string;
  name: string;
  coverage: string;
  countries: Set<string>; // ISO 3166-1 numeric codes
  overlay: { x: number; y: number };
};

// ISO 3166-1 numeric codes for the countries in each region. The topojson
// feature `id` matches this code.
const REGIONS: Region[] = [
  {
    key: "north-america",
    name: "North America",
    coverage: "98.4%",
    countries: new Set([
      "840", // US
      "124", // Canada
      "484", // Mexico
      "320", // Guatemala
      "084", // Belize
      "222", // El Salvador
      "340", // Honduras
      "558", // Nicaragua
      "188", // Costa Rica
      "591", // Panama
      "192", // Cuba
      "214", // Dominican Republic
      "332", // Haiti
      "388", // Jamaica
      "044", // Bahamas
    ]),
    overlay: { x: 220, y: 220 },
  },
  {
    key: "europe",
    name: "Europe",
    coverage: "98.0%",
    countries: new Set([
      "826", // UK
      "372", // Ireland
      "250", // France
      "276", // Germany
      "724", // Spain
      "620", // Portugal
      "380", // Italy
      "528", // Netherlands
      "056", // Belgium
      "756", // Switzerland
      "040", // Austria
      "752", // Sweden
      "578", // Norway
      "208", // Denmark
      "246", // Finland
      "616", // Poland
      "203", // Czechia
      "300", // Greece
      "348", // Hungary
      "642", // Romania
      "100", // Bulgaria
      "643", // Russia
      "804", // Ukraine
      "112", // Belarus
      "440", // Lithuania
      "428", // Latvia
      "233", // Estonia
      "703", // Slovakia
      "705", // Slovenia
      "191", // Croatia
      "070", // Bosnia & Herzegovina
      "688", // Serbia
      "807", // North Macedonia
      "008", // Albania
      "499", // Montenegro
      "352", // Iceland
    ]),
    overlay: { x: 490, y: 195 },
  },
  {
    key: "asia",
    name: "Asia",
    coverage: "97.4%",
    countries: new Set([
      "156", // China
      "392", // Japan
      "410", // South Korea
      "408", // North Korea
      "356", // India
      "360", // Indonesia
      "608", // Philippines
      "704", // Vietnam
      "764", // Thailand
      "458", // Malaysia
      "702", // Singapore
      "586", // Pakistan
      "050", // Bangladesh
      "104", // Myanmar
      "144", // Sri Lanka
      "116", // Cambodia
      "418", // Laos
      "158", // Taiwan
      "792", // Turkey
      "682", // Saudi Arabia
      "784", // UAE
      "512", // Oman
      "634", // Qatar
      "048", // Bahrain
      "414", // Kuwait
      "364", // Iran
      "368", // Iraq
      "422", // Lebanon
      "760", // Syria
      "400", // Jordan
      "376", // Israel
      "398", // Kazakhstan
      "860", // Uzbekistan
      "417", // Kyrgyzstan
      "762", // Tajikistan
      "795", // Turkmenistan
      "004", // Afghanistan
      "051", // Armenia
      "268", // Georgia
      "031", // Azerbaijan
      "887", // Yemen
      "496", // Mongolia
    ]),
    overlay: { x: 700, y: 260 },
  },
  {
    key: "south-america",
    name: "South America",
    coverage: "96.8%",
    countries: new Set([
      "076", // Brazil
      "032", // Argentina
      "152", // Chile
      "170", // Colombia
      "604", // Peru
      "862", // Venezuela
      "218", // Ecuador
      "068", // Bolivia
      "600", // Paraguay
      "858", // Uruguay
      "328", // Guyana
      "740", // Suriname
      "254", // French Guiana
    ]),
    overlay: { x: 305, y: 400 },
  },
  {
    key: "africa",
    name: "Africa",
    coverage: "95.7%",
    countries: new Set([
      "012", // Algeria
      "024", // Angola
      "204", // Benin
      "072", // Botswana
      "854", // Burkina Faso
      "108", // Burundi
      "120", // Cameroon
      "132", // Cape Verde
      "140", // Central African Republic
      "148", // Chad
      "174", // Comoros
      "178", // Congo
      "180", // DR Congo
      "384", // Cote d'Ivoire
      "262", // Djibouti
      "818", // Egypt
      "226", // Equatorial Guinea
      "232", // Eritrea
      "748", // Eswatini
      "231", // Ethiopia
      "266", // Gabon
      "270", // Gambia
      "288", // Ghana
      "324", // Guinea
      "624", // Guinea-Bissau
      "404", // Kenya
      "426", // Lesotho
      "430", // Liberia
      "434", // Libya
      "450", // Madagascar
      "454", // Malawi
      "466", // Mali
      "478", // Mauritania
      "480", // Mauritius
      "504", // Morocco
      "508", // Mozambique
      "516", // Namibia
      "562", // Niger
      "566", // Nigeria
      "646", // Rwanda
      "686", // Senegal
      "694", // Sierra Leone
      "706", // Somalia
      "710", // South Africa
      "728", // South Sudan
      "729", // Sudan
      "834", // Tanzania
      "768", // Togo
      "788", // Tunisia
      "800", // Uganda
      "894", // Zambia
      "716", // Zimbabwe
      "732", // Western Sahara
    ]),
    overlay: { x: 490, y: 360 },
  },
  {
    key: "oceania",
    name: "Oceania",
    coverage: "97.1%",
    countries: new Set([
      "036", // Australia
      "554", // New Zealand
      "598", // Papua New Guinea
      "242", // Fiji
      "540", // New Caledonia
      "090", // Solomon Islands
      "548", // Vanuatu
    ]),
    overlay: { x: 780, y: 400 },
  },
];

const WIDTH = 900;
const HEIGHT = 500;

// Map every country id → the region it belongs to (if any). Used so hovering
// any country in a region lights up the whole region at once.
const COUNTRY_TO_REGION: Record<string, number> = (() => {
  const m: Record<string, number> = {};
  REGIONS.forEach((r, i) => {
    r.countries.forEach((id) => {
      m[id] = i;
    });
  });
  return m;
})();

// Precompute d3-geo projection once
const projection = geoEqualEarth()
  .scale(170)
  .translate([WIDTH / 2, HEIGHT / 2 + 20]);
const pathGen = geoPath(projection);

// Pull the country features out of the topojson
const countriesFC = feature(
  topology as unknown as Topology,
  (topology as unknown as Topology).objects.countries as GeometryCollection,
) as FeatureCollection<Geometry, { name?: string }>;

export function WorldCoverageMap() {
  // Start with North America highlighted so the map is never blank on load.
  const [idx, setIdx] = useState<number>(0);
  const region = REGIONS[idx];

  const paths = useMemo(() => {
    return countriesFC.features
      .filter((f: Feature) => {
        const id = String((f as unknown as { id?: string | number }).id ?? "");
        // Hide Antarctica so the map matches how travel/coverage sites usually
        // present the world (inhabited continents only).
        return id.padStart(3, "0") !== "010";
      })
      .map((f: Feature) => {
        const id = String((f as unknown as { id?: string | number }).id ?? "");
        const padded = id.padStart(3, "0");
        const regionIdx = COUNTRY_TO_REGION[padded];
        const d = pathGen(f);
        return { id: padded, d, regionIdx };
      });
  }, []);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-label="World coverage map"
      >
        <g>
          {paths.map((p) => {
            if (!p.d) return null;
            const inRegion = p.regionIdx !== undefined;
            const active = p.regionIdx === idx;
            return (
              <path
                key={p.id}
                d={p.d}
                fill={active ? "#0284c7" : "#e0f2fe"}
                stroke="#ffffff"
                strokeWidth={0.6}
                style={{
                  transition: "fill 250ms ease",
                  cursor: inRegion ? "pointer" : "default",
                }}
                onMouseEnter={() => {
                  if (inRegion) setIdx(p.regionIdx as number);
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Overlay card */}
      <div
        key={region.key}
        className="pointer-events-none absolute animate-fade-in rounded-xl border border-ink-900/10 bg-white px-4 py-2 text-center shadow-lg"
        style={{
          left: `${(region.overlay.x / WIDTH) * 100}%`,
          top: `${(region.overlay.y / HEIGHT) * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="text-sm font-semibold text-brand-700">{region.name}</div>
        <div className="text-xs text-ink-500">
          Coverage: <span className="font-bold text-brand-700">{region.coverage}</span>
        </div>
      </div>
    </div>
  );
}
