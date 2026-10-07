import { libs } from '@/libs'
import packageJson from '@/package.json' with { type: 'json' }

/** Trailing slashes are noise when comparing two site URLs. */
function tidy(url: string) {
  return url.trim().replace(/\/+$/, '')
}

/**
 * Finds which entry of `src/libs.ts` the site being built is, so a page can name itself to the
 * `browse` CLI as `<lib>/<path>`.
 *
 * Nothing in the build environment holds that key, so it is recovered from where the site is
 * published:
 * 1. `url` (`NEXT_PUBLIC_URL`) equal to a library's `docs_url`, e.g. `https://pmndrs.github.io/drei`.
 *    A relative `docs_url` is this site's own entry, published on the package homepage.
 * 2. Otherwise the last segment of `basePath` (`BASE_PATH`) when it is a library key, e.g. `/drei`.
 *
 * Only libraries the CLI can read (`llms_full`) count -- the same filter as `readableLibs()` in
 * `src/cli/browse.corpus.ts`. Returns `undefined` when nothing matches.
 */
export function resolveLibKey({ url, basePath }: { url?: string; basePath?: string }) {
  const readable = Object.entries(libs).filter(([, lib]) => 'llms_full' in lib && lib.llms_full)

  if (url) {
    const found = readable.find(([, lib]) => {
      const base = lib.docs_url.startsWith('http') ? lib.docs_url : packageJson.homepage
      return tidy(base) === tidy(url)
    })
    if (found) return found[0]
  }

  if (basePath) {
    const last = basePath.split('/').filter(Boolean).at(-1)
    const found = readable.find(([key]) => key === last)
    if (found) return found[0]
  }

  return undefined
}

/**
 * The command that opens a page in the `browse` CLI, e.g. `npx @pmndrs/docs drei/loaders/gltf`.
 *
 * Without a library key, the bare path is used: the CLI accepts it when a single library has it.
 *
 * @param libKey - from `resolveLibKey()`
 * @param url - the page's path within the site, e.g. `/loaders/gltf`
 */
export function cliCommand(libKey: string | undefined, url: string) {
  const target = libKey ? `${libKey}${url}` : url
  return `npx ${packageJson.name} ${target}`
}
