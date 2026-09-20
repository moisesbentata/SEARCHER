import HomePage from "@/app/page";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Reverse Phone Lookup — ${brand.name}`,
  description:
    "Identify unknown callers and find the information connected to any phone number.",
};

export default function PhoneLookupPage() {
  return <HomePage />;
}
