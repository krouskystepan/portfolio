import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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
  },
  plugins: [],
} satisfies Config
