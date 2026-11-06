import { isInside } from '@/config.resolve'
import { repositoryRoot } from '@/utils/repositoryRoot'
import resolveMdxUrl from '@/utils/resolveMdxUrl'
import type { Root } from 'hast'
import { dirname, relative, resolve, sep } from 'node:path'
import { visit } from 'unist-util-visit'

/**
 * The URL of the repository file a relative link of an MDX page points to, when that file is out
 * of the MDX folder: on GitHub, such a link resolves on the branch viewed, but the website only
 * serves the MDX folder. So it is resolved, with `resolveMdxUrl`, under `sourcecodeBaseUrl`
 * (`SOURCECODE_BASEURL`, the repository's tree on the branch deployed), the page taken relative
 * to the repository holding it (see `repositoryRoot`, as for a code block's `file=`).
 *
 * Any other `href` is returned as is: a link staying in the MDX folder (another page, an asset),
 * one out of the repository, one with a scheme, protocol-relative, root-relative or an anchor, and
 * every link without a `sourcecodeBaseUrl` or an `mdxFolder`.
 *
 * @param href - The link as written in the MDX file
 * @param file - Absolute path of the MDX file, as written (not the CLI's copy)
 * @param mdxFolder - Absolute path of the MDX folder, as written
 * @param sourcecodeBaseUrl - The repository's tree, e.g. `https://github.com/pmndrs/docs/tree/main`
 * @example repoFileUrl('../../src/a.ts', '/repo/docs/guide/page.mdx', '/repo/docs', 'https://github.com/pmndrs/docs/tree/main') // "https://github.com/pmndrs/docs/tree/main/src/a.ts"
 */
export function repoFileUrl(
  href: string,
  file: string,
  mdxFolder: string | undefined,
  sourcecodeBaseUrl: string | undefined,
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

  const root = repositoryRoot(dirname(file))
  if (!isInside(root, target)) return href

  return resolveMdxUrl(href, relative(root, file).split(sep).join('/'), sourcecodeBaseUrl)
}

/**
 * Points a relative link to a repository file out of the MDX folder, e.g.
 * `[index.tsx](../../src/components/mdx/index.tsx)`, at that file on GitHub, with `repoFileUrl`.
 * Markdown links, `<a href>` and `<Badge href>` alike; any other link is left as is.
 *
 * @param file - Absolute path of the MDX file, as written
 * @param mdxFolder - Absolute path of the MDX folder, as written
 * @param SOURCECODE_BASEURL - The repository's tree on the branch deployed
 */
export function rehypeRepoLink(
  file: string,
  mdxFolder: string | undefined,
  SOURCECODE_BASEURL: string | undefined,
) {
  return () => (tree: Root) => {
    if (!SOURCECODE_BASEURL || !mdxFolder) return

    const resolveHref = (href: string) => repoFileUrl(href, file, mdxFolder, SOURCECODE_BASEURL)

    visit(tree, null, function (node) {
      const isMDLink = 'tagName' in node && node.tagName === 'a'
      const isHTMLLink = 'name' in node && (node.name === 'a' || node.name === 'Badge')

      if (isMDLink) {
        const href = node.properties.href
        if (typeof href === 'string') node.properties.href = resolveHref(href)
      }

      if (isHTMLLink) {
        const hrefAttr = node.attributes
          .filter((attr) => 'name' in attr)
          .find((attr) => attr.name === 'href')

        if (typeof hrefAttr?.value === 'string') hrefAttr.value = resolveHref(hrefAttr.value)
      }
    })
  }
}
