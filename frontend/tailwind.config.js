/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        jazz: {
          purple: '#5c2d91',
          gold: '#f9a01b',
          navy: '#00275d',
        },
      },
    },
  },
  plugins: [],
}
