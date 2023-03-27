/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false
  }
}

if (global.firstRun === undefined) {
  global.firstRun = false;
}

module.exports = async (phase) => {
  console.log('phase: ', phase);

  if (!global.firstRun && (phase === 'phase-production-server' || phase === 'phase-development-server')) {
    const SLEEP_TIME = 100;

    setTimeout(() => {
      console.log('Init: starting radio service');

      const http = require('http');
      http.get('http://localhost:3000/api/init-nested-api');
    }, SLEEP_TIME);

    console.log(`Init: wait for ${SLEEP_TIME}ms before starting radio service`);
    global.firstRun = true;
  }

  return nextConfig;
}
