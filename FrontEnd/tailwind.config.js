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
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Main color - xanh dương nhạt
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          main: "#3b82f6",
        },
        tag: {
          bestseller: "#d1f4ed", // xanh nhạt
          hot: "#EF4444", // đỏ
          new: "#FACC15", // vàng
          featured: "#3b82f6", // xanh dương
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
