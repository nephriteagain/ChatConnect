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
        myPrimary: '#f09666',
        mySecondary: '#072b3b',
        myAccent: '#a84115'
      }
    },
  },
  plugins: [],
}

