/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // EstateHub brand palette — keep in sync with the PRD
        brand: {
          primary: "#1F4E79",
          accent:  "#2E75B6",
          light:   "#DEEBF6",
          ink:     "#1A1A1A",
          muted:   "#595959",
          surface: "#F7F9FC"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
