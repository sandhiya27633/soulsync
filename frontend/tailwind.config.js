/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          lavender: '#A78BFA', // Soft Lavender
          mint: '#6EE7B7',     // Soft Mint
          warmwhite: '#FAFAF9',// Warm White
          cream: '#F5F5F4',    // Light cream background
          charcoal: '#1C1917', // Dark background
          slate: '#292524',    // Dark card background
          accent: '#C084FC',   // Vivid Lavender Accent
          softRed: '#FDA4AF',  // Warm soft crisis color
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
