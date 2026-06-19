/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse"],
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(pdf|test\.js|test\.ts)$/,
      use: 'ignore-loader',
    })
    return config
  },
}

module.exports = nextConfig
