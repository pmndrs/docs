export interface Library {
  title: string
  url: string
  github: string
  description: string
  // Optional banner image
  image?: string
  // Optional project icon
  icon?: string
  // Optional repository to fetch and serve docs from
  // <user>/<repo>/<branch>/<path/to/dir>
  docs?: string
}

const libraries: Record<string, Library> = {
  'react-three-fiber': {
    title: 'React Three Fiber',
    url: '/react-three-fiber',
    github: 'https://github.com/pmndrs/react-three-fiber',
    description: 'React-three-fiber is a React renderer for three.js',
    image: 'https://docs.pmnd.rs/react-three-fiber/share.jpg',
    docs: 'pmndrs/react-three-fiber/master/docs',
  },
  'react-spring': {
    title: 'React Spring',
    url: 'https://react-spring.io',
    github: 'https://github.com/pmndrs/react-spring',
    description: 'Bring your components to life with simple spring animation primitives for React',
    image: 'https://docs.pmnd.rs/react-spring/share.jpg',
  },
  drei: {
    title: 'Drei',
    url: 'https://github.com/pmndrs/drei#readme',
    github: 'https://github.com/pmndrs/drei',
    description:
      'Drei is a growing collection of useful helpers and abstractions for react-three-fiber',
    image: 'https://docs.pmnd.rs/logo-drei.jpg',
  },
  zustand: {
    title: 'Zustand',
    url: '/zustand',
    github: 'https://github.com/pmndrs/zustand',
    description:
      'Zustand is a small, fast and scalable bearbones state-management solution, it has a comfy api based on hooks',
    icon: '/zustand-icon.png',
    image: 'https://docs.pmnd.rs/zustand-resources/zustand-bear.jpg',
    docs: 'pmndrs/zustand/main/docs',
  },
  jotai: {
    title: 'Jotai',
    url: 'https://jotai.org/docs/introduction',
    github: 'https://github.com/pmndrs/jotai',
    description: 'Jotai is a primitive and flexible state management library for React',
    icon: '/jotai-icon.png',
    // image: 'https://docs.pmnd.rs/jotai-ghost.png',
  },
  a11y: {
    title: 'A11y',
    url: '/a11y',
    github: 'https://github.com/pmndrs/react-three-a11y',
    description:
      '@react-three/a11y brings accessibility to webGL with easy-to-use react-three-fiber components',
    image: 'https://docs.pmnd.rs/a11y/react-three-a11y-header.jpg',
    docs: 'pmndrs/website/docs/docs/a11y',
  },
  'react-postprocessing': {
    title: 'React Postprocessing',
    url: 'react-postprocessing',
    github: 'https://github.com/pmndrs/react-postprocessing',
    description: 'React Postprocessing is a postprocessing wrapper for @react-three/fiber',
    image: 'https://docs.pmnd.rs/react-processing.jpg',
    docs: 'pmndrs/website/docs/docs/react-postprocessing',
  },
}

export default libraries
