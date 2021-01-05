module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/react-three-fiber/getting-started/installation',
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
