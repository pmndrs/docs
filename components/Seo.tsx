import Head from 'next/head'

const sites = {
  'react-spring': {
    title: 'React Spring',
    image: 'https://docs.pmnd.rs/react-spring/share.jpg',
    description: 'Bring your components to life with simple spring animation primitives for React',
  },
  'react-three-fiber': {
    title: 'React Three Fiber',
    image: 'https://docs.pmnd.rs/react-three-fiber/share.jpg',
    description: 'React-three-fiber is a React renderer for three.js.',
  },
  drei: {
    title: 'Drei',
    image: 'https://docs.pmnd.rs/logo-drei.jpg',
    description:
      'Drei is a growing collection of useful helpers and abstractions for react-three-fiber.',
  },

  'react-postprocessing': {
    title: 'React Postprocessing',
    image: 'https://docs.pmnd.rs/react-processing.jpg',
    description: 'React Postprocessing is a postprocessing wrapper for @react-three/fiber',
  },
  zustand: {
    title: 'Zustand',
    description:
      'Zustand is a small, fast and scalable bearbones state-management solution, it has a comfy api based on hooks',
    image: 'https://docs.pmnd.rs/zustand-resources/zustand-bear.jpg',
  },
  jotai: {
    title: 'Jotai',
    description: 'Jotai is a primitive and flexible state management library for React. 👻',
    // image: 'https://docs.pmnd.rs/jotai-ghost.png',
  },
  a11y: {
    title: 'React-three-a11y',
    description:
      '@react-three/a11y brings accessibility to webGL with easy-to-use react-three-fiber components',
    image: 'https://docs.pmnd.rs/a11y/react-three-a11y-header.jpg',
  },
}

export default function SEO({ name }: { name: string }) {
  const currentSeo = sites[name]

  return currentSeo ? (
    <Head>
      <title> {currentSeo.title} Documentation</title>
      <meta property="og:site_name" content={`${currentSeo.title} documentation`} />
      <meta name="description" content={currentSeo.description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://docs.pmnd.rs/${name}`} />
      <meta property="og:title" content={`${currentSeo.title} Documentation`} />
      <meta property="og:description" content={currentSeo.description} />
      <meta property="og:image" content={currentSeo.image} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={`https://docs.pmnd.rs/${name}`} />
      <meta property="twitter:title" content={`${currentSeo.title} Documentation`} />
      <meta property="twitter:description" content={currentSeo.description} />
      <meta property="twitter:image" content={currentSeo.image} />
    </Head>
  ) : null
}
