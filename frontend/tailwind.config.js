/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream:   { DEFAULT: "#FAF7F2", 50: "#FDFCFA", 100: "#FAF7F2", 200: "#F2EBE0", 300: "#E8DDD0" },
        forest:  { DEFAULT: "#2D4A2D", light: "#3A6B3A", dark: "#1A2E1A", muted: "#4A7A4A" },
        olive:   { DEFAULT: "#6B7C3A", light: "#8A9E4A", muted: "#8A9464" },
        brown:   { DEFAULT: "#5C3D2E", light: "#7A5244", muted: "#A0756A" },
        warm:    { DEFAULT: "#C17B4A", light: "#D4956A", muted: "#E8B890" },
        charcoal:{ DEFAULT: "#1C1C1C", soft: "#2A2A2A", mid: "#3D3D3D" },
        sand:    { DEFAULT: "#D4C5A9", light: "#E8DDD0", dark: "#B8A88A" },
      },
      fontFamily: {
        serif:   ["Playfair Display", "Georgia", "serif"],
        sans:    ["DM Sans", "Inter", "-apple-system", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      backgroundImage: {
        "hero-pattern": "radial-gradient(ellipse at top left, rgba(45,74,45,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(193,123,74,0.06) 0%, transparent 60%)",
      },
      boxShadow: {
        "card":     "0 4px 24px rgba(28,22,16,0.06), 0 1px 4px rgba(28,22,16,0.04)",
        "card-md":  "0 12px 42px rgba(28,22,16,0.12), 0 3px 10px rgba(28,22,16,0.06)",
        "card-lg":  "0 24px 64px rgba(28,22,16,0.18), 0 6px 20px rgba(28,22,16,0.10)",
        "inner":    "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.04)",
        "warm":     "0 10px 36px rgba(193,123,74,0.28)",
        "forest":   "0 10px 36px rgba(45,74,45,0.30)",
        "glass":    "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.22)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-up":     "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":     "fadeIn 0.4s ease both",
        "scale-in":    "scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "slide-right": "slideRight 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "float":       "float 5s ease-in-out infinite",
        "ken-burns":   "kenBurns 18s ease-in-out infinite alternate",
        "pulse-slow":  "pulseSlow 4s ease-in-out infinite",
        "scan-beam":   "scanBeam 2.6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:     { "0%": { opacity:0, transform:"translateY(24px)" }, "100%": { opacity:1, transform:"translateY(0)" } },
        fadeIn:     { "0%": { opacity:0 }, "100%": { opacity:1 } },
        scaleIn:    { "0%": { opacity:0, transform:"scale(0.96)" }, "100%": { opacity:1, transform:"scale(1)" } },
        slideRight: { "0%": { opacity:0, transform:"translateX(-16px)" }, "100%": { opacity:1, transform:"translateX(0)" } },
        float:      { "0%,100%": { transform:"translateY(0px)" }, "50%": { transform:"translateY(-8px)" } },
        kenBurns:   { "0%": { transform:"scale(1) translate(0, 0)" }, "100%": { transform:"scale(1.12) translate(-1.5%, -1%)" } },
        pulseSlow:  { "0%,100%": { opacity:0.65 }, "50%": { opacity:1 } },
        scanBeam:   { "0%": { top:"6%", opacity:0.2 }, "50%": { top:"88%", opacity:1 }, "100%": { top:"6%", opacity:0.2 } },
      },
    },
  },
  plugins: [],
};
