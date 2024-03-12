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
    container: {
      center: true,
    },
    extend: {
      backgroundImage: {
        'profile-picture':
          'url(https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=3220&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      },
      keyframes: {
        'bubble-animation': {
          '0%': { 'border-radius': '59% 41% 70% 30% / 30% 60% 40% 70%' },
          '50%': { 'border-radius': '65% 35% 38% 62% / 51% 40% 60% 49%' },
          '100%': { 'border-radius': '28% 72% 37% 63% / 72% 28% 72% 28%' },
        },
      },
      animation: {
        'bubble-animation':
          'bubble-animation 5s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
