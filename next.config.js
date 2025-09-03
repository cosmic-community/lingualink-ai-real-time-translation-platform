/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.cosmicjs.com', 'imgix.cosmicjs.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cosmicjs.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig