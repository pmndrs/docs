import { fs } from 'memfs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import matter from 'gray-matter'
import { compileSync } from '@mdx-js/mdx'
import * as mdx from '@mdx-js/react'
import * as runtime from 'react/jsx-runtime.js'
import prism from 'mdx-prism'
import { embeds, tableOfContents } from './rehype'
import libs from 'data/libraries'

const MDX_REGEX = /\.mdx?$/

/**
 * Recursively crawls a directory, returning an array of file paths.
 */
const crawl = async (dir: string, filter?: RegExp, files: string[] = []) => {
  if (fs.lstatSync(dir).isDirectory()) {
    const filenames = fs.readdirSync(dir)
    await Promise.all(filenames.map(async (filename) => crawl(`${dir}/${filename}`, filter, files)))
  } else if (!filter || filter.test(dir)) {
    files.push(dir)
  }

  return files
}

/**
 * Gets a lib's doc params if configured.
 */
const getParams = (lib: keyof typeof libs) => {
  const config = libs[lib]
  if (!config?.docs) return

  const { dir = '', repo, branch = 'main' } = config.docs

  const gitDir = `/${repo.replace('/', '-')}-${branch}`
  const entry = dir ? `${gitDir}/${dir}` : gitDir

  return { repo, branch, gitDir, entry }
}

/**
 * Fetches all docs, filters to a lib if specified.
 */
export const getDocs = async (lib?: keyof typeof libs) => {
  // If a lib isn't specified, fetch all docs
  if (!lib) {
    const docs = await Promise.all(Object.keys(libs).map(getDocs))
    return docs.filter(Boolean).flatMap((c: Map<string, any>) => Array.from(c.values()))
  }

  // Init params, bail if lib not found
  const params = getParams(lib)
  if (!params) return

  // Clone remote
  await git.clone({
    fs,
    http,
    dir: params.gitDir,
    url: `https://github.com/${params.repo}`,
    ref: params.branch,
    singleBranch: true,
    depth: 1,
  })

  // Crawl and parse docs
  const files = await crawl(params.entry, MDX_REGEX)

  const docs = new Map()
  files.forEach((file) => {
    // Get slug from local path
    const path = file.replace(`${params.entry}/`, '')
    const slug = [lib, ...path.replace(MDX_REGEX, '').split('/')]

    // Parse frontmatter
    const source = fs.readFileSync(file)
    const { data, content } = matter(source)

    // Write params to docs map
    docs.set(slug.join('/'), { path, slug, data, content })
  })

  return docs
}

/**
 * Transpiles and hydrates a doc and its meta.
 */
export const hydrate = (content: string) => {
  // Compile MDX into JS source
  const toc = []
  const compiled = compileSync(content, {
    rehypePlugins: [prism, embeds, tableOfContents(toc)],
    outputFormat: 'function-body',
    providerImportSource: '@mdx-js/react',
  })

  // Eval and build JSX at runtime
  const Content = new Function(String(compiled))({ ...mdx, ...runtime }).default
  const children = <Content />

  return { toc, children }
}
