/** @type {import('next').NextConfig} */

// Try to import next-pwa, but gracefully handle if it's not installed
let withPWA;
try {
  withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  });
} catch (error) {
  console.warn('next-pwa not found, PWA features will be disabled');
  withPWA = (config) => config;
}

const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['leetcode.com']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
}

module.exports = withPWA(nextConfig);
