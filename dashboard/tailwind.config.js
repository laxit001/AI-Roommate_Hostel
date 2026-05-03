/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    // Disable Tailwind's preflight (CSS reset) — we use our own in index.css
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
