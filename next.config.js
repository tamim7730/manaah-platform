/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Railway specific configurations
  env: {
    RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL,
    RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN,
  },
}

module.exports = nextConfig
