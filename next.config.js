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
      {
        source: '/react-spring',
        destination: 'https://react-spring.io',
        permanent: true,
      },
      {
        source: '/react-spring/:slug*',
        destination: 'https://react-spring.io/#:slug*',
        permanent: true,
      },
      {
        source: '/drei',
        destination: 'https://github.com/pmndrs/drei#readme',
        permanent: true,
      },
      {
        source: '/drei/:slug*',
        destination: 'https://github.com/pmndrs/drei#:slug*',
        permanent: true,
      },
    ]
  },
}
