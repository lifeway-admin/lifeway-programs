/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        lifeway: {
          pink: '#c52177',
          darkpink: '#aa1d51',
          light: '#f9e8f2',
        },
      },
    },
  },
  plugins: [],
}
