import { SearchEntry } from "@/components/SearchEntry";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Reverse Email Lookup — ${brand.name}`,
  description:
    "Find the owner and linked profiles behind any email address.",
};

export default function EmailSearchPage() {
  return (
    <SearchEntry
      kind="email"
      title="Reverse Email"
      titleHighlight="Lookup"
      subtitle="Find the owner, linked profiles, and breach history behind any email address, using publicly available data from trusted sources."
    />
  );
}
