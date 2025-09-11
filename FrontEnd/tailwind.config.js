/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          100: "#2A2B3F",
        },
        primary: {
          main: "#A435F0",
        },
      },
    },
  },
  plugins: [],
};
