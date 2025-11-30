import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        custom_blue: 'var(--custom_blue)',
        custom_pink: 'var(--custom_pink)',
      },
      fontFamily: {
        outfit: 'var(--font-outfit)',
      },
    },
    keyframes: {
      custom_ping: {
        '75%, 100%': {
          transform: 'scale(1.2)',
          opacity: '0',
        },
      },
    },
    animation: {
      custom_ping: 'custom_ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    },
  },
  plugins: [],
} satisfies Config
