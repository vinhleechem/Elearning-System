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
      animation: {
        blob: "blob 7s infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
      },
    },
  },
  plugins: [],
};
