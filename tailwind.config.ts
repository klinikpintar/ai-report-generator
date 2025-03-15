import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        // primary
        blue: {
          1: "#e4f6fc",
          2: "#bae8f7",
          3: "#8dd8f2",
          4: "#5fc8ed",
          5: "#3cbde9",
          6: "#00b0eb",
          7: "#17aae2",
          8: "#0f98da",
          9: "#0888d3",
          10: "#f0f8ff" 
        },
        teal: {
          1: "#e1eef1",
          2: "#b4d4dc",
          3: "#82b7c4",
          4: "#4f9aac",
          5: "#2a849b",
          6: "#046e89",
          7: "#036681",
          8: "#035b76",
          9: "#02516c",
          10: "#013f59",
        },
        // secondary
        black: {
          1: "#e9e9e9",
          2: "#c7c7c7",
          3: "#a2a2a2",
          4: "#7c7c7c",
          5: "#606060",
          6: "#444444",
          7: "#3e3e3e",
          8: "#353535",
          9: "#2d2d2d",
          10: "#1f1f1f",
          11: "#2e2e2e",
          12: "#cbd2e0",
          13: "#1e1e1e"
        },
        magenta: {
          1: "#fbe0ec",
          2: "#f4b3d0",
          3: "#ed80b1",
          4: "#e64d91",
          5: "#e0267a",
          6: "#db0062",
          7: "#d7005a",
          8: "#d20050",
          9: "#cd0046",
          10: "#c40034",
        },
        orange: {
          50: "#fff4e6",
          100: "#ffe3c2",
          200: "#ffd199",
          300: "#ffbf70",
          400: "#ffb151",
          500: "#ffa332",
          600: "#ff9b2d",
          700: "#ff9126",
          800: "#ff881f",
          900: "#ff7713",
        },
        green: {
          50: "#e5faed",
          100: "#bef2d1",
          200: "#92e9b3",
          300: "#66e094",
          400: "#46da7d",
          500: "#25d366",
          600: "#21ce5e",
          700: "#1bc853",
          800: "#16c249",
          900: "#0db738",
          1000: "#62bb50"
        },
        yellow: {
          50: "#fffff9",
          100: "#fffeef",
          200: "#fffde5",
          300: "#fffcdb",
          400: "#fffcd3",
          500: "#fffbcb",
          600: "#fffac6",
          700: "#fffabe",
          800: "#fff9b8",
          900: "#fff8ac",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;