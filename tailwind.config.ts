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
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    colors: {
      blue: {
        50: "#e4f6fc",
        100: "#bae8f7",
        200: "#8dd8f2",
        300: "#5fc8ed",
        400: "#3cbde9",
        500: "#1ab1e5",
        600: "#17aae2",
        700: "#13a1de",
        800: "#0f98da",
        900: "#088ad3",
      },
      black: "#2D3648",
      white: "#ffffff",
      gray: "#CBD2E0",
      magenta: {
        50: "#fbe0ec",
        100: "#f4b3d0",
        200: "#ed80b1",
        300: "#e64d91",
        400: "#e0267a",
        500: "#db0062",
        600: "#d7005a",
        700: "#d20050",
        800: "#cd0046",
        900: "#c40034",
      },
    },
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
  			}
  		},
      spacing: {
        128: "32rem",
        144: "36rem",
        "25": "100px",
      },
      borderRadius: {
        lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
        "50px": "50px",
        "4xl": "2rem",
      },
      fontSize: {
        '32': '2rem',      // 32px
        '18': '1.125rem',  // 18px
        '16': '1rem',      // 16px
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;