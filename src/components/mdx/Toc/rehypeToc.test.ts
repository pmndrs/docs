import rehypeParse from 'rehype-parse'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import type { DocToC } from '@/app/[...slug]/DocsContext'
import { rehypeToc, type Node } from './rehypeToc'

const toc = (html: string) => {
  const target: DocToC[] = []
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeToc(target, '/page', 'Page'))
  processor.runSync(processor.parse(html))
  return target
}

/**
 * Runs the plugin on a hand-built tree, for the MDX nodes `rehype-parse` cannot produce.
 */
const tocOf = (root: Node) => {
  const target: DocToC[] = []
  rehypeToc(target, '/page', 'Page')()(root)
  return target
}

// Minimal hast builders
const text = (value: string) => ({ type: 'text', value }) as Node
const el = (tagName: string, children: Node[], properties = {}) =>
  ({ type: 'element', tagName, properties, children }) as Node
const jsx = (name: string, children: Node[]) =>
  ({ type: 'mdxJsxFlowElement', name, attributes: [] as Node[], children }) as Node
const root = (children: Node[]) => ({ type: 'root', children }) as Node

const count = (text: string, search: string) => text.split(search).length - 1

describe('rehypeToc', () => {
  it('includes each paragraph after a heading exactly once in its content', () => {
    const [heading] = toc('<h2>Title</h2><p>first paragraph</p><p>second paragraph</p>')

    expect(count(heading.content, 'first paragraph')).toBe(1)
    expect(count(heading.content, 'second paragraph')).toBe(1)
  })

  it('gives a heading nested in a component an id and a TOC entry', () => {
    const nested = el('h3', [text('With React')])
    const tree = root([
      el('h2', [text('Installation')]),
      jsx('Tabs', [jsx('TabsContent', [nested, el('p', [text('npm install react')])])]),
    ])

    const [installation, withReact] = tocOf(tree)

    expect(nested.properties.id).toBe('with-react')
    expect(withReact).toMatchObject({
      id: 'with-react',
      level: 2,
      title: 'With React',
      url: '/page#with-react',
    })
    expect(withReact.parent).toBe(installation)
  })

  it('suffixes the ids of the same title repeated in a page', () => {
    const ids = toc(
      '<h2>Constructor</h2><h3>Installation</h3><h3>Installation</h3><h3>Installation</h3>',
    ).map(({ id }) => id)

    expect(ids).toEqual(['constructor', 'installation', 'installation-1', 'installation-2'])
  })

  describe('content', () => {
    const tree = () =>
      root([
        el('h2', [text('Usage')]),
        el('p', [text('Pick a framework.')]),
        jsx('Tabs', [
          jsx('TabsList', [jsx('TabsTrigger', [text('React')]), jsx('TabsTrigger', [text('Vue')])]),
          jsx('TabsContent', [el('h3', [text('With React')]), el('p', [text('react panel')])]),
          jsx('TabsContent', [el('h3', [text('With Vue')]), el('p', [text('vue panel')])]),
        ]),
        el('p', [text('Then build.')]),
      ])

    it("gives a nested heading the text of its component, up to the component's end", () => {
      const [, withReact, withVue] = tocOf(tree())

      expect(withReact.content).toBe('react panel')
      expect(withVue.content).toBe('vue panel')
    })

    it('gives the text after a component back to the heading before it', () => {
      const [usage] = tocOf(tree())

      expect(usage.content).toContain('Pick a framework.')
      expect(usage.content).toContain('Then build.')
      expect(usage.content).not.toContain('panel')
    })

    it('leaves out the labels of a TabsList', () => {
      const [usage] = tocOf(tree())

      expect(usage.content).not.toContain('React')
      expect(usage.content).not.toContain('Vue')
    })

    it('leaves out the labels of a role="tablist" element', () => {
      const [heading] = toc(
        '<h2>Title</h2><div role="tablist"><button>React</button><button>Vue</button></div><p>body</p>',
      )

      expect(heading.content).toBe('body')
    })

    it('keeps the words of consecutive components apart', () => {
      const [heading] = tocOf(
        root([
          el('h2', [text('Title')]),
          jsx('Tabs', [
            jsx('TabsContent', [el('p', [text('alpha')])]),
            jsx('TabsContent', [el('p', [text('beta')])]),
          ]),
        ]),
      )

      expect(heading.content).toMatch(/alpha\s+beta/)
    })

    it('leaves out imports and expressions', () => {
      const [heading] = tocOf(
        root([
          { type: 'mdxjsEsm', value: "import { x } from './x'" } as Node,
          el('h2', [text('Title')]),
          { type: 'mdxFlowExpression', value: 'x + 1' } as Node,
          el('p', [text('body'), { type: 'mdxTextExpression', value: 'x' } as Node]),
        ]),
      )

      expect(heading.content).toBe('body')
    })
  })
})
