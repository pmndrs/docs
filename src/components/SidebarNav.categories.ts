import type { Doc } from '@/app/[...slug]/DocsContext'
import type { ReactNode } from 'react'

export type SidebarNavDoc = Pick<Doc, 'slug' | 'url' | 'title'>

/**
 * The pages a category's own entry links to, instead of listing them under the category, by
 * precedence: a README sits beside an `introduction` as one of its pages.
 */
const INDEX_PAGES = ['introduction', 'readme']

/** The page at the MDX root that is an entry of its own, rather than a page of `root`. */
const ROOT_INDEX_PAGE = 'readme'

/**
 * One entry of the docs navigation: a category (the parent folder of a page, or `root`), its own
 * page if it has one, and the pages listed under it. The README at the MDX root is an entry of its
 * own, with no pages under it.
 */
export type SidebarNavCategory = {
  key: string
  /** The folder's name, dashes as spaces. */
  label: string
  /** The root README's title, shown as written in place of `label`. */
  title?: ReactNode
  /** What the entry links to: its index page, or its first page when it has none. */
  href: string
  indexDoc?: SidebarNavDoc
  subDocs: SidebarNavDoc[]
  /** Every page of the category, its index page included. */
  docs: SidebarNavDoc[]
}

/**
 * Groups the docs into the navigation's categories, in the docs' own order.
 */
export function sidebarNavCategories(docs: SidebarNavDoc[]): SidebarNavCategory[] {
  const categories = new Map<string, Map<string, SidebarNavDoc>>()
  for (const doc of docs) {
    const page = doc.slug.at(-1)
    // A doc with no slug has no page to list, and would leave its category empty.
    if (!page) continue
    // Keyed by its URL, which no folder name can take: a folder's key has no `/`.
    const category =
      doc.slug.length === 1 && page === ROOT_INDEX_PAGE ? doc.url : doc.slug.at(-2) || 'root'

    if (!categories.has(category)) categories.set(category, new Map())
    categories.get(category)!.set(page, doc)
  }

  return [...categories].map(([category, pages]) => {
    const rootIndexDoc = category.startsWith('/') ? pages.get(ROOT_INDEX_PAGE) : undefined
    if (rootIndexDoc) {
      return {
        key: category,
        label: ROOT_INDEX_PAGE,
        title: rootIndexDoc.title || ROOT_INDEX_PAGE,
        href: rootIndexDoc.url,
        indexDoc: rootIndexDoc,
        subDocs: [],
        docs: [rootIndexDoc],
      }
    }

    const indexPage = INDEX_PAGES.find((page) => pages.has(page))
    const indexDoc = indexPage ? pages.get(indexPage) : undefined
    return {
      key: category,
      label: category.replace(/-/g, ' '),
      href: indexDoc ? indexDoc.url : [...pages.values()][0].url,
      indexDoc,
      subDocs: [...pages].filter(([page]) => page !== indexPage).map(([, doc]) => doc),
      docs: [...pages.values()],
    }
  })
}
