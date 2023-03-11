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

var firstRun = false;
module.exports = async (phase) => {
  console.log('phase: ', phase);

  if (!firstRun && (phase === 'phase-production-server' || phase === 'phase-development-server')) {
    const SLEEP_TIME = 10000;

    setTimeout(() => {
      console.log('Init: starting radio service');

      const http = require('http');
      http.get('http://localhost:3000/api/init-nested-api');
    }, SLEEP_TIME);

    console.log(`Init: wait for ${SLEEP_TIME}ms before starting radio service`);
    firstRun = true;
  }

  return nextConfig;
}
