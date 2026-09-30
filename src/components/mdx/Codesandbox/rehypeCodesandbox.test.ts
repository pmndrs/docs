import type { Root } from 'hast'
import { compileMDX } from 'next-mdx-remote/rsc'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { visit } from 'unist-util-visit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

/**
 * Runs the plugin, and returns the attributes each `<Codesandbox>` is left with, by name.
 */
async function attributesOf(source: string) {
  const sandboxes: Record<string, unknown>[] = []
  const collect = () => (tree: Root) => {
    visit(tree, null, function (node) {
      if (!('name' in node) || node.name !== 'Codesandbox') return
      const attributes = node.attributes.filter((attribute) => 'name' in attribute)
      sandboxes.push(Object.fromEntries(attributes.map(({ name, value }) => [name, value])))
    })
  }
  await compileMDX({
    source,
    options: {
      blockJS: false,
      mdxOptions: { rehypePlugins: [rehypeCodesandbox(relFilePath, baseUrl), collect] },
    },
    components: { Codesandbox: () => null },
  })
  return sandboxes
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

  it('treats an empty `img` as no image, and removes it', async () => {
    for (const img of ['', '   ']) {
      const source = `<Codesandbox id="3rjsl" img="${img}" />`
      expect(await boxesOf(source)).toEqual([{ id: '3rjsl' }])
      expect(await attributesOf(source)).toEqual([{ id: '3rjsl' }])
    }
  })

  it('leaves a URL of any scheme, or protocol-relative, as is', async () => {
    for (const img of ['data:image/png;base64,iVBORw0KGgo=', '//example.com/a.png']) {
      expect(await boxesOf(`<Codesandbox id="3rjsl" img="${img}" />`)).toEqual([
        { id: '3rjsl', img },
      ])
    }
  })

  it('reads `img` and `id` written as a string literal expression', async () => {
    const source = `<Codesandbox id={"3rjsl"} img={'a.png'} />`
    expect(await boxesOf(source)).toEqual([{ id: '3rjsl', img: `${baseUrl}/authoring/a.png` }])
    expect(await attributesOf(source)).toEqual([
      { id: expect.anything(), img: `${baseUrl}/authoring/a.png` },
    ])
  })

  it('skips an `img` written as another expression', async () => {
    expect(await boxesOf('<Codesandbox id="3rjsl" img={"a" + ".png"} />')).toEqual([
      { id: '3rjsl' },
    ])
  })

  describe('with the MDX folder on disk', () => {
    let MDX: string

    beforeEach(() => {
      MDX = fs.mkdtempSync(path.join(os.tmpdir(), 'rehypeCodesandbox-'))
      fs.mkdirSync(path.join(MDX, 'authoring'))
      fs.writeFileSync(path.join(MDX, 'authoring', 'a.png'), '')
      vi.stubEnv('MDX', MDX)
    })

    afterEach(() => {
      vi.unstubAllEnvs()
      vi.restoreAllMocks()
      fs.rmSync(MDX, { recursive: true })
    })

    it('keeps an `img` found in the MDX folder', async () => {
      expect(await boxesOf('<Codesandbox id="3rjsl" img="a.png" />')).toEqual([
        { id: '3rjsl', img: `${baseUrl}/authoring/a.png` },
      ])
    })

    it('warns about an `img` missing from the MDX folder, and removes it', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const source = '<Codesandbox id="3rjsl" img="missing.png" />'

      expect(await boxesOf(source)).toEqual([{ id: '3rjsl' }])
      expect(await attributesOf(source)).toEqual([{ id: '3rjsl' }])

      const message = warn.mock.calls[0][0]
      expect(message).toContain(relFilePath)
      expect(message).toContain('3rjsl')
      expect(message).toContain(path.join(MDX, 'authoring', 'missing.png'))
    })
  })
})
