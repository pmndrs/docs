module.exports = {
  productionBrowserSourceMaps: true,
  images: {
    domains: ['codesandbox.io'],
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/docs/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
      {
        source: '/jotai',
        destination: 'https://jotai.pmnd.rs/docs/introduction',
        permanent: true,
      },
      {
        source: '/jotai/:slug*',
        destination: 'https://jotai.pmnd.rs/docs/:slug*',
        permanent: true,
      },
    ]
  },
}
