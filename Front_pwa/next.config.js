/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', '192.168.1.4', '192.168.0.8'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'http://192.168.1.4:3000',
  },
}

module.exports = nextConfig
