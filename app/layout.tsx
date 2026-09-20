import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/lib/brand";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
  description:
    "Instantly identify unknown callers, verify email owners, and see who's really on the other end. Fast, accurate, discreet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-ink-900 antialiased">
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
