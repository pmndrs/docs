import fetch from 'node-fetch'
import matter from 'gray-matter'
import setValue from 'set-value'
import { isDoc, sanitize } from './mdx'
import libraries from 'data/libraries'
import type { Doc } from 'hooks/useDocs'

/**
 * Fetches a doc from a lib.
 */
export const getDoc = async (slug: string[]): Promise<Doc> => {
  // Get target lib settings
  const [lib, ...parts] = slug
  const target = libraries[lib]
  if (!target?.docs) return

  // Generate doc url
  const { dir, repo, branch = 'main' } = target.docs
  const localPath = [dir, ...parts].filter(Boolean).join('/')
  const editURL = `https://github.com/${repo}/blob/${branch}/${localPath}.mdx?raw=true`

  // Fetch and sanitize doc source
  const source = await fetch(`${editURL}?raw=true`)
    .then((res) => res.text())
    .then(sanitize)

  // Parse it
  const { data, content } = matter(source)

  // Create internal meta
  const url = `/${slug.join('/')}`
  const pathname = slug[slug.length - 1]

  // Internal meta fallbacks
  data.title = data.title ?? pathname.replace(/\-/g, ' ')
  data.description = data.description ?? ''
  data.nav = data.nav ?? Infinity

  return { ...data, data, content, editURL, slug, url }
}

export const getPaths = async (lib: string) => {
  const target = libraries[lib]
  if (!target) return []

  const { repo, branch = 'main', dir } = target.docs

  const { tree }: any = await fetch(
    `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: { Authorization: `token ${process.env.GITHUB_API_TOKEN}` },
    }
  ).then((res) => res.json())

  const paths = tree
    .map(({ path }) => path)
    .filter((path) => isDoc(path, dir))
    .map((path) => (dir ? path.replace(`${dir}/`, '') : path))
    .map((path) => path.replace('.mdx', ''))

  return paths
}

/**
 * Fetches docs for a lib.
 */
export const getDocs = async (lib: string): Promise<Doc[]> => {
  // Get docs paths
  const paths = await getPaths(lib)

  // Generate docs
  const docs = (
    await Promise.all(
      paths.map(async (path) => {
        const slug = [lib, ...path.split('/')]
        return getDoc(slug)
      })
    )
  ).sort((a: any, b: any) => (a.nav > b.nav ? 1 : -1))

  return docs
}

/**
 * Fetches docs for all libs.
 */
export const getAllDocs = async (): Promise<Doc[]> => {
  // Get ids of libs who have opted into hosting docs
  const libs = Object.entries(libraries).filter(([_, lib]) => lib.docs)
  const docs = await Promise.all(libs.map(async ([key]) => getDocs(key)))

  return docs.flat()
}

export type NavItems = { [lib: string]: { [category: string]: Doc | { [page: string]: Doc } } }

/**
 * Builds a nested list of docs, organized by lib, category, and page keys.
 */
export const getNavItems = (lib: string, docs: Doc[]): NavItems => {
  const nav = docs.reduce((nav, doc) => {
    if (doc.slug[0] === lib) {
      const [lib, ...rest] = doc.slug
      const _path = `${lib}${rest.length === 1 ? '..' : '.'}${rest.join('.')}`
      setValue(nav, _path, doc)
    }

    return nav
  }, {})

  return nav
}
