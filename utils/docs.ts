import { data } from 'data/libraries'
import { getPaths, parseMDX } from 'utils/mdx'

const cachedDocs = new Map()

/**
 * Fetches docs for a lib.
 */
export const getDocs = async (lib: string, force = false) => {
  // If cached, return it
  const cached = cachedDocs.get(lib)
  if (!force && cached) return cached

  // Get lib docs settings
  const { docs: docsConfig } = data.find(({ id }) => id === lib)

  // Get docs paths
  const paths = await getPaths(docsConfig)

  // Generate docs
  const docs = (
    await Promise.all(
      paths.map(async (filePath) => {
        const { localPath, data, ...rest } = parseMDX(filePath, docsConfig)

        const slug = [lib, ...localPath.split('/')]
        const url = `/${slug.join('/')}`
        const pathname = slug[slug.length - 1]

        data.title = data.title || pathname.replace(/\-/g, ' ')
        data.description = data.description ?? ''
        data.nav = data.nav ?? Infinity

        return { ...rest, ...data, data, slug, url }
      })
    )
  ).sort((a: any, b: any) => (a.nav > b.nav ? 1 : -1))

  // Update cache
  cachedDocs.set(lib, docs)

  return docs
}

/**
 * Fetches docs for all libs.
 */
export const getAllDocs = async () => {
  // Get ids of libs who have opted into hosting docs
  const libs = data.filter(({ docs }) => docs).map(({ id }) => id)
  const docs = await Promise.all(libs.map(async (lib) => getDocs(lib)))

  return docs.flat()
}
