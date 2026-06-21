/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(pdf|test\.js|test\.ts)$/,
      use: 'ignore-loader',
    })
    return config
  },
}

module.exports = nextConfig
