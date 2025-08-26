/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Purdue brand colors
        purdue: {
          gold: '#CEB888',
          'gold-light': '#DACC9F',
          'gold-dark': '#B59D6B',
          black: '#000000',
          gray: {
            50: '#F9F9F9',
            100: '#F3F3F3',
            200: '#E6E6E6',
            300: '#CCCCCC',
            400: '#999999',
            500: '#666666',
            600: '#4D4D4D',
            700: '#333333',
            800: '#1A1A1A',
            900: '#0D0D0D',
          },
        },
      },
      fontFamily: {
        'sans': ['Arial', 'Helvetica', 'sans-serif'],
        'serif': ['Georgia', 'serif'],
        'heading': ['Franklin Gothic', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [],
}