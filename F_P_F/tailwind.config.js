/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#fefcf9',
          100: '#faf7f2',
          200: '#f5efe5',
          300: '#ede4d4',
          400: '#e0d3be',
          500: '#d4c4a8',
        },
        terra: {
          50:  '#fdf5f3',
          100: '#fbe8e4',
          200: '#f8d5cd',
          300: '#f2b5a8',
          400: '#e8897a',
          500: '#d4654f',
          600: '#b84a35',
          700: '#9a3d2b',
          800: '#7f3526',
          900: '#6a3025',
          950: '#3a160f',
        },
        bark: {
          50:  '#f9f6f3',
          100: '#f0eae3',
          200: '#e0d4c6',
          300: '#ccb9a3',
          400: '#b89a7e',
          500: '#a98367',
          600: '#9c725b',
          700: '#825d4c',
          800: '#6a4d42',
          900: '#574138',
          950: '#2e211c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
