import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontWeight: {
        "600": "600",
        "700": "700",
        "800": "800",
        "900": "900",
      },
      colors: {
        // ─── Brand tricolor (from ITSOL logo) ───────────────────
        "brand-blue":   "#0095E8",   // electric blue — primary
        "brand-cyan":   "#29ABE2",   // sky cyan — from logo
        "brand-green":  "#7DC338",   // tech green — from logo
        "brand-orange": "#F5820A",   // vibrant orange — from logo
        // ─── Dark backgrounds ────────────────────────────────────
        navy:           "#040F24",   // near-black dark navy
        "navy-mid":     "#0A1F4E",   // mid navy
        "navy-light":   "#0E3070",   // lighter navy accent
        // ─── Legacy aliases ──────────────────────────────────────
        coral:          "#ef4444",
        orange:         "#F5820A",
        green:          "#7DC338",
        light:          "#EEF5FF",
      },
      boxShadow: {
        soft:  "0 18px 60px rgba(4, 15, 36, 0.10)",
        blue:  "0 8px 32px rgba(0, 149, 232, 0.30)",
        green: "0 8px 32px rgba(125, 195, 56, 0.28)",
        glow:  "0 0 60px rgba(0, 149, 232, 0.25)",
      },
      backgroundImage: {
        "brand-gradient":       "linear-gradient(135deg, #0060C7 0%, #0095E8 100%)",
        "brand-tri":            "linear-gradient(135deg, #7DC338 0%, #0095E8 50%, #F5820A 100%)",
        "hero-dark":            "linear-gradient(150deg, #020B1A 0%, #040F24 40%, #071A42 75%, #0A2356 100%)",
      },
    }
  },
  plugins: []
};

export default config;
