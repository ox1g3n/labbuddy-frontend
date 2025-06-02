/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0.8', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInScale: {
          '0%': { opacity: '0.8', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        fadeInScale: 'fadeInScale 0.4s ease-out forwards',
        float: 'float 3s ease-in-out infinite'
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#6b7280 #1f2937',
        },
        '.scrollbar-thumb-gray-600': {
          'scrollbar-color': '#6b7280 transparent',
        },
        '.scrollbar-track-gray-800': {
          'scrollbar-color': '#6b7280 #1f2937',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: '#1f2937',
          'border-radius': '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: '#6b7280',
          'border-radius': '4px',
          border: '1px solid #374151',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: '#9ca3af',
        },
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },
        '.overflow-y-scroll': {
          'overflow-y': 'scroll !important',
        },
      });
    },
  ],
};
