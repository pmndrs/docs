module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/react-three-fiber/getting-started/introduction',
        permanent: true,
      },
      {
        source: '/docs/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
    ]
  },
}
