/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#04060d',
          900: '#070b18',
          800: '#0b1226',
          700: '#0f1a36',
        },
        accent: {
          green: '#22c55e',
          'green-dark': '#16a34a',
          yellow: '#facc15',
          'yellow-dark': '#eab308',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};