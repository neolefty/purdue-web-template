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
          dust: '#EBD99F',
          black: '#000000',
          aged: '#8E6F3E',
          'aged-dark': '#6b5530',
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
        // Purdue brand fonts
        'acumin': ['acumin-pro', 'Franklin Gothic', 'Arial', 'sans-serif'],
        'acumin-condensed': ['acumin-pro-condensed', 'Franklin Gothic', 'Arial', 'sans-serif'],
        // United Sans - needs separate licensing, using Impact as fallback per brand guidelines
        'united': ['United Sans', 'Impact', 'Arial Black', 'Arial', 'sans-serif'],
        'source': ['source-serif-pro', 'Georgia', 'serif'],
        // Default font stacks
        'sans': ['acumin-pro', 'Franklin Gothic', 'Arial', 'sans-serif'],
        'serif': ['source-serif-pro', 'Georgia', 'serif'],
        'heading': ['acumin-pro', 'Franklin Gothic', 'Arial', 'sans-serif'],
        // Alternative fonts when brand fonts unavailable (per brand guide)
        'impact': ['Impact', 'Arial Black', 'Arial', 'sans-serif'],
        'franklin': ['Franklin Gothic', 'Arial', 'sans-serif'],
        'georgia': ['Georgia', 'serif'],
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
