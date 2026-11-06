import { isInside } from '@/config.resolve'
import { repositoryRoot } from '@/utils/repositoryRoot'
import resolveMdxUrl from '@/utils/resolveMdxUrl'
import { dirname, relative, resolve, sep } from 'node:path'

/**
 * The URL of the repository file a relative link of an MDX page points to, when that file is out
 * of the MDX folder: on GitHub, such a link resolves on the branch viewed, but the website only
 * serves the MDX folder. So it is resolved, with `resolveMdxUrl`, under `sourcecodeBaseUrl`, from
 * the page's path in its repository (see `repositoryRoot`, as for a code block's `file=`).
 *
 * Any other `href` is returned as is: a link staying in the MDX folder (another page, an asset),
 * one out of the repository, one with a scheme, protocol-relative, root-relative or an anchor, and
 * every link without a `sourcecodeBaseUrl` or an `mdxFolder`.
 *
 * @param href - The link as written in the MDX file
 * @param file - Absolute path of the MDX file, as written (not the CLI's copy)
 * @param mdxFolder - Absolute path of the MDX folder, as written
 * @param sourcecodeBaseUrl - `SOURCECODE_BASEURL`: the repository's tree on the branch deployed, e.g. `https://github.com/pmndrs/docs/tree/main`
 * @param root - The repository holding `file`, when the caller already has it
 * @example repoFileUrl('../../src/a.ts', '/repo/docs/guide/page.mdx', '/repo/docs', 'https://github.com/pmndrs/docs/tree/main') // "https://github.com/pmndrs/docs/tree/main/src/a.ts"
 */
export function repoFileUrl(
  href: string,
  file: string,
  mdxFolder: string | undefined,
  sourcecodeBaseUrl: string | undefined,
  root = repositoryRoot(dirname(file)),
) {
  if (!sourcecodeBaseUrl || !mdxFolder) return href
  // Relative only: no scheme, and not `//host`, `/path` or `#anchor`
  if (!href || /^([a-z][a-z\d+.-]*:|\/|#)/i.test(href)) return href

  let target: string
  try {
    target = resolve(dirname(file), decodeURIComponent(href.replace(/[?#].*$/, '')))
  } catch {
    return href // A malformed escape: not a path
  }
  if (isInside(mdxFolder, target)) return href
  if (!isInside(root, target)) return href

  return resolveMdxUrl(href, relative(root, file).split(sep).join('/'), sourcecodeBaseUrl)
}
