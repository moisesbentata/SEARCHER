import { notFound } from "next/navigation";
import { ResultsClient } from "./ResultsClient";

export const dynamic = "force-dynamic";

export default function ResultsPage({
  params,
  searchParams,
}: {
  params: { kind: string };
  searchParams: { q?: string; cc?: string };
}) {
  const kind = params.kind;
  if (kind !== "phone" && kind !== "email") notFound();

  const q = (searchParams.q ?? "").trim();
  const cc = (searchParams.cc ?? "US").toUpperCase();

  if (!q) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">No query provided</h1>
        <p className="mt-2 text-ink-500">Start a new search from the homepage.</p>
      </section>
    );
  }

  return <ResultsClient kind={kind} query={q} defaultCountry={cc} />;
}
