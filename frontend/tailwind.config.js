/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
        },
        dark: {
          bg: '#1c1c1cff',
          surface: '#1e1e1e',
          border: '#333333',
        }
      },
      fontFamily: {
        sans: ['Saira', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
