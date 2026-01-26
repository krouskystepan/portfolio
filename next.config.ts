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
    ]
  },
  
  // Debugging purposes
  //   reactStrictMode: true,
}

export default nextConfig
