/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          100: "#2A2B3F",
          200: "#8B4309",
        },
        primary: {
          main: "#A435F0",
        },
        tag: {
          bestseller: "#d1f4ed", // xanh nhạt
          hot: "#EF4444", // đỏ
          new: "#FACC15", // vàng
          featured: "#A855F7", // tím
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981", // xanh lá tươi
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b", // vàng cam
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444", // đỏ
        },
      },
    },
  },
  plugins: [],
};
