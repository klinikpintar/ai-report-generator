/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
        gray: "#CBD2E0"
      },
      extend: {
        spacing: {
          128: "32rem",
          144: "36rem",
          '25': '100px',
        },
        borderRadius: {
          "50px": "50px",
          "4xl": "2rem",
        },
      },
    },
  };
  