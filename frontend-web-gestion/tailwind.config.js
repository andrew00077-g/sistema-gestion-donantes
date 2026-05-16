/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'med-red': '#C91C1C',
        'med-dark': '#1F2937',
      }
    },
  },
  plugins: [],
}