const basePath = process.env.BASE_PATH || ''
const distDir = process.env.DIST_DIR || undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    // domains: ['codesandbox.io'],
    unoptimized: true,
  },
  basePath,
  output: 'export',
  distDir,
  // async redirects() {
  //   return [
  //     {
  //       source: '/home',
  //       destination: '/',
  //       permanent: true,
  //     },
  //     {
  //       source: '/docs/:slug*',
  //       destination: '/:slug*',
  //       permanent: true,
  //     },
  //     {
  //       source: '/xr',
  //       destination: '/xr/getting-started/introduction',
  //       permanent: true,
  //     },
  //     {
  //       source: '/jotai',
  //       destination: 'https://jotai.pmnd.rs/docs/introduction',
  //       permanent: true,
  //     },
  //     {
  //       source: '/jotai/:slug*',
  //       destination: 'https://jotai.pmnd.rs/docs/:slug*',
  //       permanent: true,
  //     },
  //     {
  //       source: '/react-spring',
  //       destination: 'https://react-spring.io',
  //       permanent: true,
  //     },
  //     {
  //       source: '/react-spring/:slug*',
  //       destination: 'https://react-spring.io/#:slug*',
  //       permanent: true,
  //     },
  //     {
  //       source: '/drei',
  //       destination: 'https://github.com/pmndrs/drei#readme',
  //       permanent: true,
  //     },
  //     {
  //       source: '/drei/:slug*',
  //       destination: 'https://github.com/pmndrs/drei#:slug*',
  //       permanent: true,
  //     },
  //   ]
  // },
}
// console.log('nextConfig=', nextConfig)

export default nextConfig
