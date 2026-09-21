import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Trust-inducing sky blue — the ClarityCheck green replaced with a
        // lighter, more institutional blue (finance / banking / medical vibe)
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Royal blue for the primary CTA button
        accent: {
          50: "#eef3ff",
          100: "#dbe4ff",
          200: "#b8caff",
          300: "#8ba7ff",
          400: "#5a7cff",
          500: "#3055ea",
          600: "#1e42d6",
          700: "#1a37b3",
          800: "#1a318f",
          900: "#1c2d72",
        },
        ink: {
          900: "#0b1220",
          800: "#111a2e",
          700: "#1b2540",
          500: "#4b5876",
          400: "#6b7691",
          300: "#98a2b8",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Inter",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        "stripe-shift": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "56px 0" },
        },
        "avatar-cycle": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.45s ease-out both",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scan-line 2s linear infinite",
        "stripe-shift": "stripe-shift 1s linear infinite",
        "avatar-cycle": "avatar-cycle 1.6s ease-in-out infinite",
      },
      backgroundImage: {
        "progress-stripes":
          "linear-gradient(45deg, rgba(255,255,255,0.35) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.35) 75%, transparent 75%, transparent)",
      },
      backgroundSize: {
        stripe: "28px 28px",
      },
    },
  },
  plugins: [],
};

export default config;
