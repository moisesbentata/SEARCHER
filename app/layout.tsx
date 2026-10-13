import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Mono face used by the Stage 6 report's terminal / code-forensic
// layout. Exposed as a CSS variable so it doesn't become the default
// body font — only the report opts in.
const reportMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-report-mono",
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
    <html lang="en" className={reportMono.variable}>
      <body className="min-h-screen bg-white text-ink-900 antialiased">
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
