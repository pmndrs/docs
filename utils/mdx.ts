import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import recursiveReaddir from 'recursive-readdir'
import matter from 'gray-matter'

export interface DocsConfig {
  repo: string
  dir?: string
  branch?: string
}

/**
 * Checks for .md(x) file extension
 */
export const MARKDOWN_REGEX = /\.mdx?$/

/**
 * Uncomments frontMatter from vanilla markdown
 */
export const FRONTMATTER_REGEX = /^<!--[\s\n]*?(?=---)|(?!---)[\s\n]*?-->/g

/**
 * Removes multi and single-line comments from markdown
 */
export const COMMENT_REGEX = /<!--(.|\n)*?-->|<!--[^\n]*?\n/g

/**
 * Clones a repository.
 */
export const clone = ({ repo, branch }: DocsConfig) =>
  execSync(`git clone git://github.com/${repo}.git temp/${repo} ${branch ? `-b ${branch}` : ''}`)

/**
 * Returns a filter function to grab posts based on a docsConfig.
 */
export const isMarkdown = ({ repo, dir = '' }: DocsConfig) => {
  const docsDir = path.resolve(process.cwd(), `temp/${repo}/${dir}`)

  return (filePath: string) =>
    // Is a markdown file
    MARKDOWN_REGEX.test(filePath) &&
    // Is in markdown dir
    filePath.startsWith(docsDir) &&
    // Doesn't start with _, private/meta for wikis
    !filePath.startsWith(path.resolve(docsDir, '_'))
}

/**
 * Traverses a repo for matching docs, returning local paths.
 */
export const getPaths = async ({ repo, dir = '', branch }: DocsConfig) => {
  // Check if repo exists on disk, otherwise clone it
  const repoDir = path.resolve(process.cwd(), `temp/${repo}`)
  if (!fs.existsSync(repoDir)) clone({ repo, dir, branch })

  // Traverses repo, returning its file contents and their paths
  const paths: string[] = await recursiveReaddir(repoDir)

  return paths.filter(isMarkdown({ repo, dir, branch }))
}

/**
 * Parses MDX from a repo, returning its data and paths.
 */
export const parseMDX = (filePath: string, { repo, dir = '', branch = 'main' }: DocsConfig) => {
  // Sanitize markdown
  const postData = fs
    .readFileSync(filePath, { encoding: 'utf-8' })
    // Remove <!-- --> comments from frontMatter
    .replace(FRONTMATTER_REGEX, '')
    // Remove extraneous comments from post
    .replace(COMMENT_REGEX, '')

  // Parse it
  const { content, data } = matter(postData)

  // Get relative file path
  const relativePath = filePath
    .replace(path.resolve(process.cwd(), `temp/${repo}`), '')
    .replace(/\\+/g, '/')
    .replace(/^\//, '')

  // Get local web path
  const localPath = relativePath
    // Remove folder prefix
    .replace(`${dir}/`, '')
    .replace(MARKDOWN_REGEX, '')
    .toLowerCase()

  // Get remote GitHub path
  const isWiki = repo.includes('.wiki')
  const remotePath = isWiki
    ? `https://github.com/${repo.replace('.wiki', '/wiki')}/${localPath}`
    : `https://github.com/${repo}/tree/${branch}/${relativePath}`

  return { content, data, relativePath, localPath, remotePath }
}
