import { execFileSync } from 'node:child_process'
import { isAbsolute, relative, resolve, sep } from 'node:path'

// Every page is compiled with it: git is asked once per folder, rather than once per page
const byFolder = new Map<string, string | undefined>()

function gitPrefix(folder: string) {
  try {
    return execFileSync('git', ['rev-parse', '--show-prefix'], {
      cwd: folder,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    // Not a git checkout (e.g. the sources `vercel deploy` uploads), or no git
    return undefined
  }
}

function readMdxRepoPath(folder: string) {
  const prefix = gitPrefix(folder)
  if (prefix !== undefined) return prefix.replace(/\/+$/, '')

  // Without git, the build is taken to run from the repository root, as Vercel's does
  const fromCwd = relative(process.cwd(), folder)
  if (fromCwd.startsWith('..') || isAbsolute(fromCwd)) return undefined
  return fromCwd.split(sep).join('/')
}

/**
 * The MDX folder, relative to the root of its repository, e.g. `docs` (`''` at the root), or
 * `undefined` when it is not known.
 *
 * The folder is the original one (`PMNDRS_MDX_SOURCE`) when the CLI compiles a copy of it, or
 * else `MDX`. Its git checkout tells where the root is; without one, the working directory is
 * taken as the root, when the folder is under it.
 */
export function mdxRepoPath() {
  const mdx = process.env.PMNDRS_MDX_SOURCE || process.env.MDX
  if (!mdx) return undefined

  const folder = resolve(mdx)
  if (!byFolder.has(folder)) byFolder.set(folder, readMdxRepoPath(folder))
  return byFolder.get(folder)
}
