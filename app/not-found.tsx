import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-6xl font-bold text-ink-300">404</div>
      <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-ink-500">The page you were looking for isn&apos;t here.</p>
      <Link href="/" className="mt-6 inline-flex items-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
        Back home
      </Link>
    </section>
  );
}
