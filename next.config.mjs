/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Expose Vercel's own env flag to the client bundle so client code can
    // gate dev-only UI (like the Stage-6 skip button) on Preview but hide
    // it in Production. Vercel sets VERCEL_ENV automatically.
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "development",
  },
};

export default nextConfig;
