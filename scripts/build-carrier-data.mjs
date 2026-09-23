#!/usr/bin/env node
// Fetch Google libphonenumber carrier prefix files (Apache 2.0, public data)
// for a curated set of dial codes, parse them into a single JSON we ship as
// lib/carrier-data.json. Longest-prefix match in that map returns the
// carrier for any number — no external API, no keys, no rate limit.
//
// Run: node scripts/build-carrier-data.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "lib", "carrier-data.json");
const BASE =
  "https://raw.githubusercontent.com/google/libphonenumber/master/resources/carrier/en";

const DIAL_CODES = [
  1,   // US / Canada / Caribbean (NANP)
  20,  // Egypt
  27,  // South Africa
  30,  // Greece
  31,  // Netherlands
  32,  // Belgium
  33,  // France
  34,  // Spain
  36,  // Hungary
  39,  // Italy
  40,  // Romania
  41,  // Switzerland
  43,  // Austria
  44,  // United Kingdom
  45,  // Denmark
  46,  // Sweden
  47,  // Norway
  48,  // Poland
  49,  // Germany
  52,  // Mexico
  54,  // Argentina
  55,  // Brazil
  56,  // Chile
  57,  // Colombia
  58,  // Venezuela
  60,  // Malaysia
  61,  // Australia
  62,  // Indonesia
  63,  // Philippines
  64,  // New Zealand
  65,  // Singapore
  66,  // Thailand
  81,  // Japan
  82,  // South Korea
  84,  // Vietnam
  86,  // China
  90,  // Turkey
  91,  // India
  92,  // Pakistan
  234, // Nigeria
  254, // Kenya
  351, // Portugal
  352, // Luxembourg
  353, // Ireland
  354, // Iceland
  358, // Finland
  380, // Ukraine
  420, // Czechia
  421, // Slovakia
  852, // Hong Kong
  886, // Taiwan
  960, // Maldives
  966, // Saudi Arabia
  971, // United Arab Emirates
  972, // Israel
];

async function fetchCarrierFile(dialCode) {
  const url = `${BASE}/${dialCode}.txt`;
  try {
    const r = await fetch(url);
    if (!r.ok) {
      console.warn(`  ${dialCode}: ${r.status} ${r.statusText}`);
      return null;
    }
    return await r.text();
  } catch (e) {
    console.warn(`  ${dialCode}: ${e.message}`);
    return null;
  }
}

function parseCarrierFile(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) continue;
    const idx = clean.indexOf("|");
    if (idx <= 0) continue;
    const prefix = clean.slice(0, idx).trim();
    const carrier = clean.slice(idx + 1).trim();
    if (!prefix || !carrier) continue;
    // Only accept digit-only prefixes
    if (!/^\d+$/.test(prefix)) continue;
    out[prefix] = carrier;
  }
  return out;
}

async function main() {
  const merged = {};
  let totalEntries = 0;
  for (const dc of DIAL_CODES) {
    process.stdout.write(`${dc} `);
    const text = await fetchCarrierFile(dc);
    if (!text) continue;
    const parsed = parseCarrierFile(text);
    for (const [prefix, carrier] of Object.entries(parsed)) {
      merged[prefix] = carrier;
    }
    totalEntries += Object.keys(parsed).length;
  }
  console.log(`\nParsed ${totalEntries} prefix→carrier rows total.`);
  console.log(`Writing ${Object.keys(merged).length} unique prefixes to ${OUT}`);
  await fs.writeFile(OUT, JSON.stringify(merged));
  const stat = await fs.stat(OUT);
  console.log(`  ${(stat.size / 1024).toFixed(1)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
