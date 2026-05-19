/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source:      '/articles',
        destination: '/guides',
        permanent:   true,
      },
      {
        source:      '/articles/:slug',
        destination: '/guides/:slug',
        permanent:   true,
      },
      {
        source:      '/articles/:slug/print',
        destination: '/guides/:slug/print',
        permanent:   true,
      },
    ]
  },
}

module.exports = nextConfig
