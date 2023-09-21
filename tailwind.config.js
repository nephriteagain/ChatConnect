/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        myText: '#f6fbfe',
        myBackground: '#051e29',
        myPrimary: '#4F709C',
        mySecondary: '#072b3b',
        myAccent: '#E5D283'
      }
    },
  },
  plugins: [],
}

