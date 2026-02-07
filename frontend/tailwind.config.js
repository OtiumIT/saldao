/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#121212',
          blackSoft: '#1a1a1a',
          gray: '#2C2C2C',
          gold: '#F2C94C',
          goldBright: '#FFD700',
          goldDark: '#D4A83A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
