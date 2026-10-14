/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Expose Vercel's own env flag to the client bundle so client code can
    // gate dev-only UI (like the Stage-6 skip button) on Preview but hide
    // it in Production. Vercel sets VERCEL_ENV automatically.
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "development",
  },
  // pdfkit (pulled in by @react-pdf/renderer) loads its standard PostScript
  // fonts via dynamic require at runtime. Vercel's serverless bundler
  // tree-shakes those .cjs files out because the require path is dynamic,
  // which breaks PDF generation on prod with:
  //   Cannot find module '/var/task/node_modules/pdfkit/js/standard-fonts/Helvetica.cjs'
  // Force the whole standard-fonts folder (plus the AFM metric files pdfkit
  // reads alongside them) into every serverless function so the PDF route
  // can resolve them at runtime.
  experimental: {
    outputFileTracingIncludes: {
      "/api/report/**/*": [
        "./node_modules/pdfkit/js/data/**/*",
        "./node_modules/pdfkit/js/standard-fonts/**/*",
        "./node_modules/fontkit/**/*",
      ],
    },
  },
};

export default nextConfig;
