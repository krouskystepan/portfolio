import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    qualities: [80, 90]
  }
  // Debugging purposes
  //   reactStrictMode: true,
}

export default nextConfig
