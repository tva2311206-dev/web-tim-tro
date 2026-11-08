/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAFAF7',
        'blue-light': '#EAF4FB',
        navy: '#173B57',
        'green-light': '#DCEFE5',
        'orange-earth': '#E58B55',
        'navy-dark': '#0F2A3F',
        'navy-light': '#2C5F8A',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(23, 59, 87, 0.08)',
        'card-hover': '0 8px 24px rgba(23, 59, 87, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
