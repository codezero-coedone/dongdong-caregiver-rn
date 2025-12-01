/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF', // Blue color from the design
        kakao: '#FEE500',   // Kakao yellow
        apple: '#000000',   // Apple black
      },
    },
  },
  plugins: [],
}
