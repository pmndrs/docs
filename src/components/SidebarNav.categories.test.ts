import { describe, expect, it } from 'vitest'
import { sidebarNavCategories, type SidebarNavDoc } from './SidebarNav.categories'

function doc(path: string, title = path.split('/').at(-1)): SidebarNavDoc {
  return { slug: path.split('/'), url: `/${path}`, title }
}

/** The categories as `label -> href [index] : sub-pages`, to compare at a glance. */
function outline(docs: SidebarNavDoc[]) {
  return sidebarNavCategories(docs).map(
    ({ label, href, indexDoc, subDocs }) =>
      `${label} -> ${href}${indexDoc ? ' [index]' : ''}: ${subDocs.map(({ url }) => url).join(' ')}`,
  )
}

describe('sidebarNavCategories', () => {
  it('groups pages by folder, an `introduction` page being its folder own entry', () => {
    expect(
      outline([
        doc('getting-started/introduction'),
        doc('getting-started/install'),
        doc('api/canvas'),
        doc('api/hooks'),
      ]),
    ).toEqual([
      'getting started -> /getting-started/introduction [index]: /getting-started/install',
      'api -> /api/canvas: /api/canvas /api/hooks',
    ])
  })

  it('keeps pages at the root in a `root` category', () => {
    expect(outline([doc('changelog'), doc('faq')])).toEqual(['root -> /changelog: /changelog /faq'])
  })

  it('takes a `readme` page as its folder own entry, like `introduction`', () => {
    expect(
      outline([doc('zigzag-chair/readme', 'Zigzag Chair'), doc('zigzag-chair/assembly')]),
    ).toEqual(['zigzag chair -> /zigzag-chair/readme [index]: /zigzag-chair/assembly'])
    expect(outline([doc('zigzag-chair/readme', 'Zigzag Chair')])).toEqual([
      'zigzag chair -> /zigzag-chair/readme [index]: ',
    ])
  })

  it('prefers `introduction` to `readme` when a folder has both', () => {
    expect(outline([doc('guide/readme'), doc('guide/introduction')])).toEqual([
      'guide -> /guide/introduction [index]: /guide/readme',
    ])
  })

  it('makes the root `readme` an entry of its own, labelled by its title', () => {
    const categories = sidebarNavCategories([
      doc('readme', 'integral'),
      doc('zigzag-chair/readme', 'Zigzag Chair'),
      doc('changelog'),
    ])
    expect(
      categories.map(({ label, title, href, indexDoc, subDocs }) => ({
        label: title ?? label,
        href,
        index: indexDoc?.url,
        subDocs: subDocs.length,
      })),
    ).toEqual([
      { label: 'integral', href: '/readme', index: '/readme', subDocs: 0 },
      {
        label: 'zigzag chair',
        href: '/zigzag-chair/readme',
        index: '/zigzag-chair/readme',
        subDocs: 0,
      },
      { label: 'root', href: '/changelog', index: undefined, subDocs: 1 },
    ])
  })
})
