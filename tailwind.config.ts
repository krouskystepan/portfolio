import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    extend: {
      keyframes: {
        bubble: {
          '0%': { 'border-radius': '59% 41% 70% 30% / 30% 60% 40% 70%' },
          '50%': { 'border-radius': '65% 35% 38% 62% / 51% 40% 60% 49%' },
          '100%': { 'border-radius': '28% 72% 37% 63% / 72% 28% 72% 28%' },
        },
        fadeInFromTop: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        bubble: 'bubble 5s linear infinite alternate',
        fadeInFromTop: 'fadeInFromTop 0.5s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
