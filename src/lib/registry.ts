/**
 * Registry of pmndrs libraries with their federated documentation URLs.
 * This is used by the MCP server to resolve library documentation endpoints.
 */

export interface LibraryConfig {
  url: string
  title?: string
  description?: string
}

/**
 * Registry mapping library names to their documentation URLs.
 * Based on the problem statement, this focuses on libraries with their own doc sites.
 */
export const REGISTRY: Record<string, LibraryConfig> = {
  'react-three-fiber': {
    url: 'https://r3f.docs.pmnd.rs',
    title: 'React Three Fiber',
    description: 'React-three-fiber is a React renderer for three.js',
  },
  'zustand': {
    url: 'https://zustand.docs.pmnd.rs',
    title: 'Zustand',
    description: 'A small, fast and scalable state-management solution',
  },
  'drei': {
    url: 'https://drei.docs.pmnd.rs',
    title: 'Drei',
    description: 'Useful helpers and abstractions for react-three-fiber',
  },
  'viverse': {
    url: 'https://pmndrs.github.io/viverse',
    title: 'viverse',
    description: 'Toolkit for building Three.js and React Three Fiber Apps for VIVERSE',
  },
}
