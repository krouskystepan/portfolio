import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    qualities: [80, 90]
  },

  async redirects() {
    return [
      {
        source: '/gambling-bot',
        destination: 'https://discord.gg/T9B9pk9a4a',
        permanent: false, // 302 — use true if you want a 301
      },
      {
        source: '/t/json-formatter',
        destination: '/t/data-workbench',
        permanent: true
      },
      {
        source: '/t/csv-json-converter',
        destination: '/t/data-workbench?tab=csv',
        permanent: true
      },
      {
        source: '/t/json-to-ts',
        destination: '/t/data-workbench?tab=ts',
        permanent: true
      }
    ]
  },
  
  // Debugging purposes
  //   reactStrictMode: true,
}

export default nextConfig
