module.exports = {
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
