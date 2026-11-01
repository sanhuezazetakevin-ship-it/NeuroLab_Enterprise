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
        glass: {
          50: 'rgba(255, 255, 255, 0.03)',
          100: 'rgba(255, 255, 255, 0.06)',
          200: 'rgba(255, 255, 255, 0.10)',
          300: 'rgba(255, 255, 255, 0.15)',
          400: 'rgba(255, 255, 255, 0.20)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.18)',
        },
        zinc: {
          850: '#1c1d22',
          900: '#14151a',
          925: '#0f1014',
          950: '#0a0a0d',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glass-hover': '0 16px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.18)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass-light': '0 8px 30px 0 rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)',
        'glass-light-hover': '0 14px 35px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '32px',
      }
    },
  },
  plugins: [],
}
