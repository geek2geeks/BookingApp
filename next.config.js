/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  // @ts-expect-error - Next.js webpack configuration type
  webpack: function(config) {
    if (!config.resolve) {
      config.resolve = {}
    }
    config.resolve.fallback = { fs: false, path: false }
    return config
  }
}

module.exports = nextConfig
