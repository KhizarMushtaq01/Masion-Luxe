/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9f0',
          100: '#f9f0d8',
          200: '#f2dfa8',
          300: '#e8c870',
          400: '#d4a843',
          500: '#c9a96e',
          600: '#b8963d',
          700: '#9a7a2e',
          800: '#7d6125',
          900: '#664f1e',
        },
        obsidian: {
          DEFAULT: '#0a0a0a',
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#d0d0d0',
          300: '#a8a8a8',
          400: '#7a7a7a',
          500: '#555555',
          600: '#3d3d3d',
          700: '#2a2a2a',
          800: '#1a1a1a',
          900: '#0a0a0a',
        },
        cream: {
          DEFAULT: '#f9f5f0',
          50: '#fdfcfa',
          100: '#f9f5f0',
          200: '#f2eadf',
          300: '#e8d8c4',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Jost"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        luxury: '0.35em',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in-right': 'slideInRight 0.4s ease forwards',
        'slide-in-left': 'slideInLeft 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        luxury: '0 4px 30px rgba(0,0,0,0.08)',
        'luxury-lg': '0 20px 60px rgba(0,0,0,0.12)',
        gold: '0 4px 20px rgba(201,169,110,0.3)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a96e, #f0d080, #c9a96e)',
        'dark-gradient': 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
        'hero-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.65))',
      }
    },
  },
  plugins: [],
}
