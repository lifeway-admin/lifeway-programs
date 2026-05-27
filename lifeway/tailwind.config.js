/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'lw-pink': '#e91e8c',
        'lw-pink-dark': '#c4176f',
        'lw-pink-light': '#fdf2f8',
        'lw-navy': '#1a1f3c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

