import { renderToHtml } from '@/test-utils'
import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'
import { Entries, type Entry } from './Entries'

const entry = (boxes: Entry['boxes']): Entry => ({
  title: <>Page</>,
  url: '/guide/page',
  slug: ['guide', 'page'],
  boxes,
})

describe('Entries', () => {
  it('keeps grouped page and sandbox destinations independent, and excludes requested groups', async () => {
    const html = await renderToHtml(
      <Entries
        items={[
          entry([{ id: 'first' }, { id: 'second' }]),
          { ...entry([]), url: '/hidden/page', slug: ['hidden', 'page'] },
        ]}
        excludedGroups={['hidden']}
      />,
    )
    const $ = load(html)
    expect($('h2').text()).toBe('guide')
    expect($('ul > li')).toHaveLength(1)
    expect(
      $('li a')
        .map((_, link) => $(link).attr('href'))
        .get(),
    ).toEqual(['/guide/page', 'https://codesandbox.io/s/first', 'https://codesandbox.io/s/second'])
    expect($('a a, a button, button a, button button')).toHaveLength(0)
  })

  it("thumbs a page with its sandbox's `img`", async () => {
    const html = await renderToHtml(
      <Entries items={[entry([{ id: '3rjsl', img: 'https://example.com/a.png' }])]} />,
    )
    expect(html).toContain('href="https://codesandbox.io/s/3rjsl"')
    expect(html).toContain('src="https://example.com/a.png"')
    expect(load(html)('a[aria-label="CodeSandbox 3rjsl"] img')).toHaveLength(1)
  })

  it('links a sandbox without an image through an accessible icon', async () => {
    const html = await renderToHtml(<Entries items={[entry([{ id: '3rjsl' }])]} />)
    expect(html).toContain('href="https://codesandbox.io/s/3rjsl"')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('codesandbox.io/api')
    expect(load(html)('a[aria-label="CodeSandbox 3rjsl"] svg')).toHaveLength(1)
  })
})
