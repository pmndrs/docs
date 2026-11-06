import { repositoryRoot } from '@/utils/repositoryRoot'
import type { Root } from 'hast'
import { dirname } from 'node:path'
import { visit } from 'unist-util-visit'
import { repoFileUrl } from './repoFileUrl'

//
// MD link
//
// [text](/path)
//
// {
//   type: 'element',
//   tagName: 'a',
//   properties: { href: '/path' },
//   children: [...],
//   position: {...}
// }

//
// HTML link
//
// <a href="/path">text</a>
//
// {
//   type: 'mdxJsxFlowElement',
//   name: 'a',
//   attributes: [
//     {
//       type: 'mdxJsxAttribute',
//       name: 'href',
//       value: '/path',
//       position: [Object]
//     }
//   ],
//   position: {...},
//   data: { _mdxExplicitJsx: true },
//   children: [...]
// }

/** The page being compiled, to point its relative links out of the MDX folder at the repository. */
type RepoLinkOptions = {
  /** Absolute path of the MDX file, as written */
  file: string
  /** Absolute path of the MDX folder, as written */
  mdxFolder: string | undefined
  /** The repository's tree on the branch deployed */
  SOURCECODE_BASEURL: string | undefined
}

/**
 * Resolves the links of a page: Markdown links, `<a href>` and `<Badge href>` alike. A link
 * starting with `/` gets `BASE_PATH` prepended; with `repo`, a relative link to a repository file
 * out of the MDX folder, e.g. `[index.tsx](../../src/components/mdx/index.tsx)`, points at that
 * file on GitHub (see `repoFileUrl`). Any other link is left as is.
 *
 * @param BASE_PATH - Prefix of the website's paths
 * @param repo - The page being compiled, for its links to repository files
 */
// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeLink(BASE_PATH: string | undefined, repo?: RepoLinkOptions) {
  return () => (tree: Root) => {
    const root = repo && repositoryRoot(dirname(repo.file))

    function resolveHref(href: string) {
      if (href.startsWith('/')) return BASE_PATH ? BASE_PATH + href : href
      if (!repo) return href
      return repoFileUrl(href, repo.file, repo.mdxFolder, repo.SOURCECODE_BASEURL, root)
    }

    visit(tree, null, function (node) {
      const isMDLink = 'tagName' in node && node.tagName === 'a'
      // `<Badge href>` renders a link too
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
