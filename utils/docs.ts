import setValue from 'set-value'
import { data as libData } from 'data/libraries'
import { getPaths, parseMDX } from 'utils/mdx'
import type { Doc } from 'hooks/useDocs'

/**
 * Parses a doc into JSX with meta.
 */
export const parseDoc = (lib: string, filePath: string): Doc => {
  // Get lib docs settings
  const target = libData.find(({ id }) => id === lib)
  if (!target?.docs) return

  // Parse doc
  const { localURL, data, ...rest } = parseMDX(filePath, target.docs)

  // Create internal meta
  const slug = [lib, ...localURL.split('/')]
  const url = `/${slug.join('/')}`
  const pathname = slug[slug.length - 1]

  // Internal meta fallbacks
  data.title = data.title ?? pathname.replace(/\-/g, ' ')
  data.description = data.description ?? ''
  data.nav = data.nav ?? Infinity

  return { ...rest, ...data, data, slug, url }
}

/**
 * Fetches docs for a lib.
 */
export const getDocs = async (lib: string): Promise<Doc[]> => {
  // Get target lib settings
  const target = libData.find(({ id }) => id === lib)
  if (!target?.docs) return

  // Get docs paths
  const paths = await getPaths(target.docs)

  // Generate docs
  const docs = paths
    .map((filePath) => parseDoc(lib, filePath))
    .sort((a: any, b: any) => (a.nav > b.nav ? 1 : -1))

  return docs
}

/**
 * Fetches docs for all libs.
 */
export const getAllDocs = async (): Promise<Doc[]> => {
  // Get ids of libs who have opted into hosting docs
  const libs = libData.filter(({ docs }) => docs)
  const docs = await Promise.all(libs.map(async ({ id }) => getDocs(id)))

  return docs.flat()
}

export type NavItems = { [lib: string]: { [category: string]: Doc | { [page: string]: Doc } } }

/**
 * Builds a nested list of docs, organized by lib, category, and page keys.
 */
export const getNavItems = (docs: Doc[]): NavItems => {
  const nav = docs.reduce((nav, file) => {
    const [lib, ...rest] = file.slug
    const _path = `${lib}${rest.length === 1 ? '..' : '.'}${rest.join('.')}`
    setValue(nav, _path, file)
    return nav
  }, {})

  return nav
}
