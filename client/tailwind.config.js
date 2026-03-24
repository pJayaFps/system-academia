/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        accent: '#7c3aed'
      },
      boxShadow: {
        premium: '0 16px 40px -20px rgba(124, 58, 237, 0.45)'
      }
    }
  },
  plugins: []
};
