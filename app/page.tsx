import { SearchEntry } from "@/components/SearchEntry";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `${brand.name} — ${brand.tagline}`,
};

export default function HomePage() {
  return (
    <SearchEntry
      kind="phone"
      title="Reverse Phone"
      titleHighlight="Lookup"
      subtitle="Identify unknown callers and find the information connected to any phone number, using publicly available data from trusted sources."
    />
  );
}
