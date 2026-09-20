import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          200: "#bcd1ff",
          300: "#8eb3ff",
          400: "#5a8aff",
          500: "#3663f5",
          600: "#2247e0",
          700: "#1c37b3",
          800: "#1b308f",
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
      },
      animation: {
        "fade-in": "fade-in 0.45s ease-out both",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scan-line 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
