import { renderToHtml } from '@/cli/render'
import { describe, expect, it } from 'vitest'
import { Entries, type Entry } from './Entries'

const entry = (boxes: Entry['boxes']): Entry => ({
  title: <>Page</>,
  url: '/guide/page',
  slug: ['guide', 'page'],
  boxes,
})

describe('Entries', () => {
  it("thumbs a page with its sandbox's `img`", async () => {
    const html = await renderToHtml(
      <Entries items={[entry([{ id: '3rjsl', img: 'https://example.com/a.png' }])]} />,
    )
    expect(html).toContain('href="https://codesandbox.io/s/3rjsl"')
    expect(html).toContain('src="https://example.com/a.png"')
    expect(html).toContain('h-[1em]')
  })

  it('shows a 1em CodeSandbox icon for a sandbox without `img`', async () => {
    const html = await renderToHtml(<Entries items={[entry([{ id: '3rjsl' }])]} />)
    expect(html).toContain('href="https://codesandbox.io/s/3rjsl"')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('codesandbox.io/api')
    expect(html).toMatch(/<svg[^>]*lucide-codesandbox[^>]*size-\[1em\]/)
  })
})
