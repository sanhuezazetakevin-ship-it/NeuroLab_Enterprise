/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        slate: {
          750: '#283548',
          850: '#151e2e',
          900: '#0c121d',
          950: '#070a11',
        }
      }
    },
  },
  plugins: [],
}
