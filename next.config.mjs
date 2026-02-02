const basePath = process.env.BASE_PATH || ''
const distDir = process.env.DIST_DIR || undefined
const output = process.env.OUTPUT || undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    // domains: ['codesandbox.io'],
    unoptimized: true,
  },
  basePath,
  distDir,
  output,
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
      //
      // {
      //   source: '/xr',
      //   destination: '/xr/getting-started/introduction',
      //   permanent: true,
      // },
      {
        source: '/xr/:slug*',
        destination: 'https://pmndrs.github.io/xr/docs/:slug*',
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

      // {
      //   source: '/drei',
      //   destination: 'https://pmndrs.github.io/drei',
      //   permanent: true,
      // },
      // {
      //   source: '/drei/:slug*',
      //   destination: 'https://github.com/pmndrs/drei/:slug*',
      //   permanent: true,
      // },

      // {
      //   source: '/react-three-fiber/:slug*',
      //   destination: 'https://pmndrs.github.io/react-three-fiber/:slug*',
      //   permanent: true,
      // },

      {
        source: '/zustand/:slug*',
        destination: 'https://pmndrs.github.io/zustand/:slug*',
        permanent: true,
      },

      {
        source: '/a11y/:slug*',
        destination: 'https://pmndrs.github.io/react-three-a11y/:slug*',
        permanent: true,
      },

      {
        source: '/react-postprocessing/:slug*',
        destination: 'https://pmndrs.github.io/react-postprocessing/:slug*',
        permanent: true,
      },

      {
        source: '/uikit/:slug*',
        destination: 'https://pmndrs.github.io/uikit/docs/:slug*',
        permanent: true,
      },
    ]
  },
}
// console.log('nextConfig=', nextConfig)

export default nextConfig
