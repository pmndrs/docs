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
      // Redirects to prevent link breakage (https://github.com/pmndrs/website/issues/139)
      {
        source: '/react-three-fiber/examples/showcase',
        destination: '/react-three-fiber/getting-started/examples',
        permanent: true,
      },
      {
        source: '/react-three-fiber/getting-started/basic-animations',
        destination: '/react-three-fiber/tutorials/basic-animations',
        permanent: true,
      },
      {
        source: '/react-three-fiber/getting-started/events-and-interaction',
        destination: '/react-three-fiber/tutorials/events-and-interaction',
        permanent: true,
      },
      {
        source: '/react-three-fiber/advanced/how-it-works',
        destination: '/react-three-fiber/tutorials/how-it-works',
        permanent: true,
      },
      {
        source: '/react-three-fiber/getting-started/loading-models',
        destination: '/react-three-fiber/tutorials/loading-models',
        permanent: true,
      },
      {
        source: '/react-three-fiber/getting-started/loading-textures',
        destination: '/react-three-fiber/tutorials/loading-textures',
        permanent: true,
      },
      {
        source: '/react-three-fiber/getting-started/testing',
        destination: '/react-three-fiber/tutorials/testing',
        permanent: true,
      },
      {
        source: '/react-three-fiber/getting-started/using-with-react-spring',
        destination: '/react-three-fiber/tutorials/using-with-react-spring',
        permanent: true,
      },
    ]
  },
}
