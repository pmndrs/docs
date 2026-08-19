/**
 * The pmndrs libraries this site indexes.
 *
 * Deliberately free of Next imports -- the icons live in `src/app/page.tsx`, next to the
 * `<Image>` that renders them. Everything that is not a browser reads this module: the MCP
 * route, the `browse` CLI, a script, a test.
 */

export interface Library {
  title: string
  docs_url: string
  github: string
  description: string
  // Optional banner image
  image?: string
  // Whether `${docs_url}/llms-full.txt` exists, i.e. the site is built with this
  // generator. Only these libraries can be served over MCP -- see
  // `src/app/api/[transport]/route.ts`. Flip it on once a site ships its dump.
  llms_full?: boolean
}

export const libs = {
  'react-three-fiber': {
    title: 'React Three Fiber',
    docs_url: 'https://pmndrs.github.io/react-three-fiber',
    github: 'https://github.com/pmndrs/react-three-fiber',
    description: 'React-three-fiber is a React renderer for three.js',
    llms_full: true,
  },
  'react-spring': {
    title: 'React Spring',
    docs_url: 'https://react-spring.io',
    github: 'https://github.com/pmndrs/react-spring',
    description: 'Bring your components to life with simple spring animation primitives for React',
  },
  drei: {
    title: 'Drei',
    docs_url: 'https://pmndrs.github.io/drei',
    github: 'https://github.com/pmndrs/drei',
    description:
      'Drei is a growing collection of useful helpers and abstractions for react-three-fiber',
    llms_full: true,
  },
  zustand: {
    title: 'Zustand',
    docs_url: 'https://pmndrs.github.io/zustand',
    github: 'https://github.com/pmndrs/zustand',
    description:
      'Zustand is a small, fast and scalable bearbones state-management solution, it has a comfy api based on hooks',
    llms_full: true,
  },
  jotai: {
    title: 'Jotai',
    docs_url: 'https://jotai.org/docs/introduction',
    github: 'https://github.com/pmndrs/jotai',
    description: 'Jotai is a primitive and flexible state management library for React',
  },
  valtio: {
    title: 'Valtio',
    docs_url: 'https://valtio.pmnd.rs',
    github: 'https://github.com/pmndrs/valtio',
    description: 'Valtio makes proxy-state simple for React and Vanilla',
  },
  a11y: {
    title: 'A11y',
    docs_url: 'https://pmndrs.github.io/react-three-a11y',
    github: 'https://github.com/pmndrs/react-three-a11y',
    description:
      '@react-three/a11y brings accessibility to webGL with easy-to-use react-three-fiber components',
  },
  'react-postprocessing': {
    title: 'React Postprocessing',
    docs_url: 'https://pmndrs.github.io/react-postprocessing',
    github: 'https://github.com/pmndrs/react-postprocessing',
    description: 'React Postprocessing is a postprocessing wrapper for @react-three/fiber',
  },
  uikit: {
    title: 'uikit',
    docs_url: 'https://pmndrs.github.io/uikit/docs',
    github: 'https://github.com/pmndrs/uikit',
    description: 'uikit brings user interfaces to @react-three/fiber',
  },
  xr: {
    title: 'xr',
    docs_url: 'https://pmndrs.github.io/xr/docs',
    github: 'https://github.com/pmndrs/xr',
    description: 'VR/AR for @react-three/fiber',
  },
  docs: {
    title: 'Docs',
    docs_url: '/getting-started/introduction',
    github: 'https://github.com/pmndrs/docs',
    description: 'Documentation generator for `pmndrs/*`',
    llms_full: true,
  },
  prai: {
    title: 'prai',
    docs_url: 'https://pmndrs.github.io/prai',
    github: 'https://github.com/pmndrs/prai',
    description: 'JS Framework for building step-by-step LLM instructions`',
  },
  viverse: {
    title: 'viverse',
    docs_url: 'https://pmndrs.github.io/viverse',
    github: 'https://github.com/pmndrs/viverse',
    description: 'Toolkit for building Three.js and React Three Fiber Apps for VIVERSE and beyond.',
  },
  leva: {
    title: 'leva',
    docs_url: 'https://pmndrs.github.io/leva',
    github: 'https://github.com/pmndrs/leva',
    description: 'React-first components GUI',
  },
} as const satisfies Record<string, Library>

export type SUPPORTED_LIBRARY_NAMES = keyof typeof libs
