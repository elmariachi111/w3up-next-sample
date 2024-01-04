/** @type {import('next').NextConfig} */
const webpack = require('webpack')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['arweave.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.arweave.net'
      }
    ],
    unoptimized: true
  },
  webpack: (config, options) => {
    // config.resolve.fallback = {
    //   fs: false
    // }
    const plugins = [
      ...config.plugins,
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        const mod = resource.request.replace(/^node:/, '')
        switch (mod) {
          case 'buffer':
            resource.request = 'buffer'
            break
          case 'async_hooks':
            resource.request = 'async_hooks'
            break
          default:
            throw new Error(`Not found ${mod}`)
        }
      })
    ]

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
      syncWebAssembly: true,
      topLevelAwait: true
    }
    return { ...config, plugins }
  }
}

module.exports = nextConfig
