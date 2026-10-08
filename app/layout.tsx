import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Loaded as a CSS variable so the Stage 6 report (and anywhere else that
// wants a document-style serif) can opt in without pulling the font into
// every page's critical path.
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-report-serif",
});

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
    <html lang="en" className={playfair.variable}>
      <body className="min-h-screen bg-white text-ink-900 antialiased">
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
