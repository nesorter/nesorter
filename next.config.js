/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false
  },

  async rewrites() {
    return [{
      source: '/api/:path*',
      destination: 'http://localhost:3001/api/:path*'
    }];
  }
}

module.exports = nextConfig
