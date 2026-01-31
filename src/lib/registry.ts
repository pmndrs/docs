import { libs, Library } from '@/src/app/page'

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
 * Mapping of internal library routes to their federated documentation sites.
 */
const URL_MAPPING: Record<string, string> = {
  '/react-three-fiber': 'https://r3f.docs.pmnd.rs',
  '/drei': 'https://drei.docs.pmnd.rs',
  '/zustand': 'https://zustand.docs.pmnd.rs',
  '/a11y': 'https://a11y.docs.pmnd.rs',
  '/react-postprocessing': 'https://postprocessing.docs.pmnd.rs',
  '/uikit': 'https://uikit.docs.pmnd.rs',
  '/xr': 'https://xr.docs.pmnd.rs',
}

/**
 * Derives the full documentation URL for a library based on its configuration.
 * This handles the various URL patterns used across pmndrs libraries.
 */
function getLibraryDocUrl(lib: Library): string | null {
  // If the library has a full URL (starts with https://), use it
  if (lib.url.startsWith('https://')) {
    return lib.url
  }

  // Return mapped URL if it exists
  if (URL_MAPPING[lib.url]) {
    return URL_MAPPING[lib.url]
  }

  // For libraries without a federated doc site, return null
  return null
}

/**
 * Registry mapping library names to their documentation URLs.
 * Dynamically generated from the main libs registry.
 */
export const REGISTRY: Record<string, LibraryConfig> = Object.entries(libs)
  .map(([key, lib]) => {
    const url = getLibraryDocUrl(lib)
    if (!url) return null

    return [
      key,
      {
        url,
        title: lib.title,
        description: lib.description,
      },
    ]
  })
  .filter((entry): entry is [string, LibraryConfig] => entry !== null)
  .reduce(
    (acc, [key, config]) => {
      acc[key] = config
      return acc
    },
    {} as Record<string, LibraryConfig>,
  )
