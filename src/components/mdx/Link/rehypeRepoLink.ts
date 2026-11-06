import { repoFileUrl } from '@/utils/resolveMdxUrl'
import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

/**
 * Points a relative link to a repository file out of the MDX folder, e.g.
 * `[index.tsx](../../src/components/mdx/index.tsx)`, at that file on GitHub, with `repoFileUrl`.
 * Markdown links, `<a href>` and `<Badge href>` alike; any other link is left as is.
 *
 * @param relFilePath - The MDX file, relative to the MDX folder
 * @param mdxRepoPath - The MDX folder, relative to the repository root
 * @param SOURCECODE_BASEURL - The repository's tree on the branch deployed
 */
export function rehypeRepoLink(
  relFilePath: string,
  mdxRepoPath: string | undefined,
  SOURCECODE_BASEURL: string | undefined,
) {
  return () => (tree: Root) => {
    if (!SOURCECODE_BASEURL || mdxRepoPath === undefined) return

    const resolve = (href: string) =>
      repoFileUrl(href, relFilePath, mdxRepoPath, SOURCECODE_BASEURL)

    visit(tree, null, function (node) {
      const isMDLink = 'tagName' in node && node.tagName === 'a'
      const isHTMLLink = 'name' in node && (node.name === 'a' || node.name === 'Badge')

      if (isMDLink) {
        const href = node.properties.href
        if (typeof href === 'string') node.properties.href = resolve(href)
      }

      if (isHTMLLink) {
        const hrefAttr = node.attributes
          .filter((attr) => 'name' in attr)
          .find((attr) => attr.name === 'href')

        if (typeof hrefAttr?.value === 'string') hrefAttr.value = resolve(hrefAttr.value)
      }
    })
  }
}
