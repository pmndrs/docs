import { compileMDX } from 'next-mdx-remote/rsc'
import { describe, expect, it } from 'vitest'
import { rehypeCodesandbox, type Box } from './rehypeCodesandbox'

const baseUrl = 'http://localhost:60141'
const relFilePath = '/authoring/codesandbox.mdx'

/**
 * Runs the plugin the way the docs' 1st pass does, and returns the boxes it collected.
 */
async function boxesOf(source: string, { MDX_BASEURL = baseUrl }: { MDX_BASEURL?: string } = {}) {
  const boxes: Box[] = []
  await compileMDX({
    source,
    options: {
      blockJS: false,
      mdxOptions: { rehypePlugins: [rehypeCodesandbox(relFilePath, MDX_BASEURL, boxes)] },
    },
    components: { Codesandbox: () => null },
  })
  return boxes
}

describe('rehypeCodesandbox', () => {
  it('collects the id of a sandbox without `img`', async () => {
    expect(await boxesOf('<Codesandbox id="3rjsl" />')).toEqual([{ id: '3rjsl' }])
  })

  it('resolves a relative `img` against the page, like an `<img src>`', async () => {
    expect(await boxesOf('<Codesandbox id="3rjsl" img="cell-fracture.webp" />')).toEqual([
      { id: '3rjsl', img: `${baseUrl}/authoring/cell-fracture.webp` },
    ])
    expect(await boxesOf('<Codesandbox id="3rjsl" img="../shots/a.png" />')).toEqual([
      { id: '3rjsl', img: `${baseUrl}/shots/a.png` },
    ])
  })

  it('leaves a full URL as is', async () => {
    const img = 'https://example.com/a.png'
    expect(await boxesOf(`<Codesandbox id="3rjsl" img="${img}" />`)).toEqual([{ id: '3rjsl', img }])
  })

  it('leaves a relative `img` as is without `MDX_BASEURL`', async () => {
    expect(await boxesOf('<Codesandbox id="3rjsl" img="a.png" />', { MDX_BASEURL: '' })).toEqual([
      { id: '3rjsl', img: 'a.png' },
    ])
  })

  it('takes `screenshot_url` as a deprecated alias of `img`', async () => {
    expect(await boxesOf('<Codesandbox id="3rjsl" screenshot_url="a.png" />')).toEqual([
      { id: '3rjsl', img: `${baseUrl}/authoring/a.png` },
    ])
  })

  it('prefers `img` over `screenshot_url`, whatever their order', async () => {
    expect(await boxesOf('<Codesandbox id="3rjsl" img="a.png" screenshot_url="b.png" />')).toEqual([
      { id: '3rjsl', img: `${baseUrl}/authoring/a.png` },
    ])
    expect(await boxesOf('<Codesandbox id="3rjsl" screenshot_url="b.png" img="a.png" />')).toEqual([
      { id: '3rjsl', img: `${baseUrl}/authoring/a.png` },
    ])
  })

  it('finds sandboxes inline too, in page order', async () => {
    const source = [
      '<ul>',
      '  <li>',
      '    [one](https://example.com) <Codesandbox id="one" img="one.png" />',
      '  </li>',
      '</ul>',
      '',
      '<Codesandbox id="two" />',
    ].join('\n')
    expect(await boxesOf(source)).toEqual([
      { id: 'one', img: `${baseUrl}/authoring/one.png` },
      { id: 'two' },
    ])
  })
})
