/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Optional: customize ShadCN themes or add soft palette
        background: "#f9fafb",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // for ShadCN animations
  ],
  experimental: {
    optimizeUniversalDefaults: true, // optional; OK to keep
  },
};
