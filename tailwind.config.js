/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // TheraFlow calm palette
        sage:    { 50: "#f4f7f4", 100: "#e6ede6", 200: "#c9d9c9", 300: "#a3bea3", 400: "#749f74", 500: "#507f50", 600: "#3d6b3d", 700: "#315531", 800: "#284428", 900: "#213821" },
        sky:     { 50: "#f0f7ff", 100: "#e0f0fe", 200: "#b9e0fd", 300: "#7cc8fb", 400: "#38adf6", 500: "#0e94e7", 600: "#0274c4", 700: "#035d9f", 800: "#074f84", 900: "#0c426e" },
        lavender:{ 50: "#f5f3ff", 100: "#ede8ff", 200: "#ddd4ff", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95" },
        blush:   { 50: "#fff5f7", 100: "#ffe4e8", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e" },
        stone:   { 50: "#fafaf9", 100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1", 400: "#a8a29e", 500: "#78716c", 600: "#57534e", 700: "#44403c", 800: "#292524", 900: "#1c1917" },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 2px 20px 0 rgba(0,0,0,0.06)",
        card: "0 4px 32px 0 rgba(80,127,80,0.10)",
        float: "0 8px 40px 0 rgba(80,127,80,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "bounce-dot": "bounceDot 1.2s infinite ease-in-out",
        "pulse-soft": "pulseSoft 2s infinite ease-in-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(14px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        bounceDot: { "0%,80%,100%": { transform: "scale(0)", opacity: 0.5 }, "40%": { transform: "scale(1)", opacity: 1 } },
        pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
};
