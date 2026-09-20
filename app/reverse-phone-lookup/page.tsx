import { SearchEntry } from "@/components/SearchEntry";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Reverse Phone Lookup — ${brand.name}`,
  description:
    "Identify unknown callers and find the information connected to any phone number.",
};

export default function PhoneSearchPage() {
  return (
    <SearchEntry
      kind="phone"
      title="Reverse Phone"
      titleHighlight="Lookup"
      subtitle="Identify unknown callers and find the information connected to any phone number, using publicly available data from trusted sources."
    />
  );
}
