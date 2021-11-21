import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import recursiveReaddir from 'recursive-readdir'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import { data } from 'data/libraries'

const MARKDOWN_REGEX = /\.mdx?$/

/**
 * Clones a repository.
 */
export const clone = (repo: string, branch?: string) =>
  execSync(`git clone git://github.com/${repo}.git temp/${repo} ${branch ? `-b ${branch}` : ''}`)

/**
 * Traverses a repo for matching docs, returning local paths.
 */
export const getPaths = async (repo: string, branch?: string) => {
  // Check if repo exists on disk, otherwise clone it
  const repoDir = path.resolve(process.cwd(), `temp/${repo}`)
  if (!fs.existsSync(repoDir)) clone(repo, branch)

  // Traverses repo, returning its file contents and their paths
  const paths: string[] = await recursiveReaddir(repoDir)

  return paths
}

const cachedDocs = new Map()

/**
 * Fetches docs for a lib.
 */
export const getDocs = async (lib: string) => {
  // If cached, return it
  const cached = cachedDocs.get(lib)
  if (cached) return cached

  // Get lib docs settings
  const { docs: docsConfig } = data.find(({ id }) => id === lib)
  const { repo, dir = '', branch } = docsConfig

  // Fetch docs paths
  const paths = await getPaths(repo, branch)

  const docsDir = path.resolve(process.cwd(), `temp/${repo}/${dir}`)

  // Filters to markdown files in target dir
  const isMarkdown = (filePath: string) =>
    filePath.startsWith(docsDir) && MARKDOWN_REGEX.test(filePath)

  // Generate docs
  const docs = (
    await Promise.all(
      paths.filter(isMarkdown).map(async (filePath) => {
        const localPath = filePath
          // Get relative path
          .replace(docsDir, '')
          .replace(MARKDOWN_REGEX, '')
          // Normalize paths for web
          .replace(/\\+/g, '/')
          .replace(/^\//, '')
          .toLowerCase()

        const postData = fs.readFileSync(filePath, { encoding: 'utf-8' })
        const { content, data } = matter(postData)

        const slug = [lib, ...localPath.split('/')]
        const url = `/${slug.join('/')}`
        const pathname = slug[slug.length - 1]

        const title = data.title || pathname.replace(/\-/g, ' ')
        const description = data.description ? await serialize(data.description) : ''
        const nav = data.nav ?? Infinity

        return { slug, url, title, description, nav, content, data }
      })
    )
  ).sort((a: any, b: any) => (a.nav > b.nav ? 1 : -1))

  cachedDocs.set(lib, docs)

  return docs
}

/**
 * Fetches docs for all libs.
 */
export const getAllDocs = async () => {
  // Get ids of libs who have opted into hosting docs
  const libs = data.filter(({ docs }) => docs).map(({ id }) => id)
  const docs = await Promise.all(libs.map(getDocs))

  return docs.flat()
}
