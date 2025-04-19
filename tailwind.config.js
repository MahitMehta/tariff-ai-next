/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark gray color palette
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        gray: {
          50: "#f7f8f8",
          100: "#eaeced",
          200: "#d5d9dc",
          300: "#b7bdc2",
          400: "#959ca3",
          500: "#6e757e",
          600: "#515861",
          700: "#3d4148",
          800: "#212529", // Darker gray
          850: "#181c1f", // Even darker
          900: "#121417",
          950: "#0a0b0e",
        },
        charcoal: {
          50: "#eaeaea",
          100: "#d1d1d1",
          200: "#a3a3a3",
          300: "#757575",
          400: "#545454",
          500: "#333333",
          600: "#292929",
          700: "#1f1f1f",
          800: "#121212", // Very dark charcoal
          900: "#0a0a0a",
          950: "#050505",
        },
        // Enhanced primary colors
        primary: {
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
        // Enhanced accent colors
        accent: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
      },
      backgroundColor: {
        dropdown: "#121417", // Custom dropdown background
        "dropdown-hover": "#1e293b", // Custom hover state
        "dropdown-active": "#0c4a6e", // Custom active state
      },
      borderColor: {
        dropdown: "#333333", // Custom dropdown border
      },
      textColor: {
        dropdown: "#f7f8f8", // Custom dropdown text
        "dropdown-muted": "#959ca3", // Custom muted text
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
        dropdown: "opacity, transform, max-height",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "ease-out-quad": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
      },
      animation: {
        "dropdown-in": "dropdownIn 250ms ease-out-quad forwards",
        "dropdown-out": "dropdownOut 200ms ease-in forwards",
      },
      keyframes: {
        dropdownIn: {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(-5px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        dropdownOut: {
          "0%": { opacity: "1", transform: "scale(1) translateY(0)" },
          "100%": { opacity: "0", transform: "scale(0.95) translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
