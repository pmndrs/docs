module.exports = {
  images: {
    domains: ['codesandbox.io'],
  },
  async redirects() {
    return [
      {
        source: '/docs/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
    ]
  },
}
