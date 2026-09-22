import { SearchEntry } from "@/components/SearchEntry";
import { LandingSections } from "@/components/LandingSections";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `${brand.name} — Reverse Phone Lookup`,
  description:
    "Identify unknown callers and find the information connected to any phone number, using publicly available data from trusted sources.",
};

export default function HomePage() {
  return (
    <>
      <SearchEntry
        kind="phone"
        title="Reverse Phone"
        titleHighlight="Lookup"
        subtitle="Identify unknown callers and find the information connected to any phone number, using publicly available data from trusted sources."
      />
      <LandingSections />
    </>
  );
}
