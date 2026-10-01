import { renderToHtml } from '@/cli/render'
import { join } from 'node:path'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { compileMdxContent, compileMdxFrontmatter } from './compileMdxContent'

describe('compileMdxFrontmatter', () => {
  const relFilePath = '/test/file.mdx'
  const baseUrl = undefined

  it('compiles plain text correctly', async () => {
    const result = await compileMdxFrontmatter('Hello World')
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toBe('Hello World')
  })

  it('compiles markdown links correctly', async () => {
    const result = await compileMdxFrontmatter('[link](#section)')
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<a[^>]*href="#section"[^>]*>link<\/a>/)
  })

  it('compiles inline code correctly', async () => {
    const result = await compileMdxFrontmatter('Use `code` here')
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/Use <code[^>]*>code<\/code> here/)
  })

  it('compiles bold and italic text correctly', async () => {
    const result = await compileMdxFrontmatter('**bold** and *italic*')
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<strong>bold<\/strong> and <em>italic<\/em>/)
  })
})

describe('compileMdxContent', () => {
  const relFilePath = '/test/file.mdx'
  const absoluteFilePath = '/home/user/docs/test/file.mdx'
  const baseUrl = undefined
  const title = 'Test Title'
  const url = '/test/file'
  const tableOfContents: any[] = []
  const entries: any[] = []

  it('compiles full MDX content with text', async () => {
    const result = await compileMdxContent('This is **bold** text with *italic* formatting.', {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(
      /<p[^>]*>This is <strong>bold<\/strong> text with <em>italic<\/em> formatting\.<\/p>/,
    )
  })

  it('compiles MDX with code blocks', async () => {
    const result = await compileMdxContent('```js\nconst x = 1;\n```', {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    // Code blocks have complex HTML structure with syntax highlighting
    expect(html).toMatch(/<div[^>]*>/)
    expect(html).toMatch(/<pre[^>]*>/)
    expect(html).toMatch(/<code[^>]*>/)
    expect(html).toContain('const')
    expect(html).toContain('x')
    expect(html).toContain('1')
  })

  it('shows the title of a code block as a file name, in a header with its copy button', async () => {
    const result = await compileMdxContent('```ts title="lib/utils.ts"\nexport const x = 1\n```', {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    const html = renderToString(result.content)
    // The header: the TypeScript logo, the file name, then the copy button, before the code
    const header = html.slice(0, html.indexOf('<pre'))
    expect(header).toMatch(/<svg[^>]*viewBox="0 0 24 24"[^>]*fill="currentColor"/)
    expect(header).toContain('lib/utils.ts')
    expect(header).toContain('aria-label="Copy to clipboard"')
    // Not a tooltip of the code
    expect(html).not.toMatch(/<pre[^>]*title=/)
    expect(html).toMatch(/<pre[^>]*class="language-ts/)
  })

  it.each([
    ['with a title', '```css title="globals.css" collapsible\n:root {}\n```'],
    ['without a title', '```css collapsible\n:root {}\n```'],
  ])('makes a collapsible code block collapsed, %s', async (_, source) => {
    const result = await compileMdxContent(source, {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    const html = renderToString(result.content)
    // Closed, the frame clips the code: on the server, a collapsible block is taken for a long one
    expect(html).toMatch(/<div[^>]*data-closed[^>]*>/)
    expect(html).toContain('group-data-closed/code:max-h-64')
    // The header, title or not, holds the trigger, which controls the clip, and the copy button
    const header = html.slice(0, html.indexOf('<pre'))
    const controls = header.match(/aria-controls="([^"]+)"[^>]*aria-expanded="false"[^>]*>Expand</)
    expect(controls).not.toBeNull()
    expect(html).toContain(`id="${controls?.[1]}"`)
    expect(header).toContain('aria-label="Copy to clipboard"')
    // The fade's button, a pointer shortcut, is no second control
    expect(html).toMatch(/<button[^>]*tabindex="-1"[^>]*aria-hidden="true"[^>]*>Expand</)
    expect(html.match(/>Expand</g)).toHaveLength(2)
  })

  it('compiles MDX with links', async () => {
    const result = await compileMdxContent('Check [this link](#section)', {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*>Check <a[^>]*href="#section"[^>]*>this link<\/a><\/p>/)
  })

  it('compiles Tabs, with markdown in a TabsContent', async () => {
    const source = [
      '<Tabs defaultValue="vue">',
      '  <TabsList>',
      '    <TabsTrigger value="react">React</TabsTrigger>',
      '    <TabsTrigger value="vue">Vue</TabsTrigger>',
      '  </TabsList>',
      '  <TabsContent value="react">',
      '',
      '    ```tsx',
      '    useState(0)',
      '    ```',
      '',
      '  </TabsContent>',
      '  <TabsContent value="vue">',
      '    Vue is a progressive framework.',
      '  </TabsContent>',
      '</Tabs>',
    ].join('\n')
    const result = await compileMdxContent(source, {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    const html = renderToString(result.content)
    expect(html).toMatch(/<button[^>]*>React<\/button>/)
    expect(html).toMatch(/<button[^>]*aria-selected="true"[^>]*>Vue<\/button>/)
    // Every panel is in the HTML: the hidden one with its code block, the shown one with its text
    expect(html).toMatch(/<pre[^>]*class="language-tsx/)
    expect(html).toContain('Vue is a progressive framework.')
    // Only the shown panel is visible: each panel is its opening tag up to the next one, and
    // `\shidden` matches the `hidden` attribute, not `data-hidden`
    const panels = html.split(/(?=<div[^>]*role="tabpanel")/).slice(1)
    const reactPanel = panels.find((panel) => panel.includes('<pre'))
    const vuePanel = panels.find((panel) => panel.includes('Vue is a progressive framework.'))
    const hiddenAttribute = /^<div[^>]*\shidden[=\s>]/
    expect(reactPanel).toMatch(hiddenAttribute)
    expect(vuePanel).toBeDefined()
    expect(vuePanel).not.toMatch(hiddenAttribute)
  })

  it('gives the headings in a TabsContent an id and a table of contents entry', async () => {
    const source = [
      '## Installation',
      '',
      'Pick your framework.',
      '',
      '<Tabs defaultValue="react">',
      '  <TabsList>',
      '    <TabsTrigger value="react">React</TabsTrigger>',
      '    <TabsTrigger value="vue">Vue</TabsTrigger>',
      '  </TabsList>',
      '  <TabsContent value="react">',
      '',
      '    ### With React',
      '',
      '    Install the React bindings.',
      '',
      '  </TabsContent>',
      '  <TabsContent value="vue">',
      '',
      '    ### With Vue',
      '',
      '    Install the Vue bindings.',
      '',
      '  </TabsContent>',
      '</Tabs>',
      '',
      'Then import it.',
    ].join('\n')
    const toc: any[] = []
    const result = await compileMdxContent(source, {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents: toc,
      entries,
    })
    const html = renderToString(result.content)
    expect(html).toContain('id="with-react"')
    expect(html).toContain('id="with-vue"')
    expect(html).not.toContain('#undefined')

    const [installation, withReact, withVue] = toc
    expect(toc.map(({ id }) => id)).toEqual(['installation', 'with-react', 'with-vue'])
    expect(withReact.parent).toBe(installation)
    expect(withVue.parent).toBe(installation)
    expect(withReact.content).toContain('Install the React bindings.')
    expect(withReact.content).not.toContain('Vue')

    // The outer heading keeps the text around the Tabs, not the triggers' or the panels'
    expect(installation.content).toContain('Pick your framework.')
    expect(installation.content).toContain('Then import it.')
    expect(installation.content).not.toContain('ReactVue')
    expect(installation.content).not.toContain('bindings')
  })
})

/**
 * next-mdx-remote 6 strips every `{...}` expression unless `blockJS: false` is passed, which
 * silently drops props like `cols={2}` (#595). These fail if that option goes away.
 */
describe('MDX expressions', () => {
  const compile = async (source: string) => {
    const result = await compileMdxContent(source, {
      relFilePath: '/test/file.mdx',
      absoluteFilePath: '/home/user/docs/test/file.mdx',
      title: 'Test Title',
      url: '/test/file',
      tableOfContents: [],
      entries: [],
    })
    return renderToString(result.content)
  }

  it('evaluates inline expressions', async () => {
    expect(await compile('sum: {1+1}')).toMatch(/sum: (<!-- -->)?2/)
  })

  it('passes expression props to components', async () => {
    expect(await compile('<Grid cols={2}>\n  <div>a</div>\n</Grid>')).toContain('md:grid-cols-2')
  })

  it('passes array props to components', async () => {
    // `embed` skips the async `Img`, which `renderToString` cannot wait for
    const html = await compile(
      '<Codesandbox id="new" embed title="Demo" tags={["alpha", "beta"]} />',
    )
    expect(html).toMatch(/<span[^>]*>alpha<\/span>/)
    expect(html).toMatch(/<span[^>]*>beta<\/span>/)
  })

  it('evaluates expressions in frontmatter values', async () => {
    const result = await compileMdxFrontmatter('sum: {1+1}')
    expect(renderToString(result.content)).toMatch(/sum: (<!-- -->)?2/)
  })
})

/**
 * CodeSandbox no longer serves sandbox screenshots, so the preview is the author's `img`, or a
 * placeholder.
 */
describe('Codesandbox', () => {
  const baseUrl = 'http://localhost:60141'

  const render = async (source: string) => {
    const result = await compileMdxContent(source, {
      relFilePath: '/authoring/codesandbox.mdx',
      absoluteFilePath: join(process.cwd(), 'docs/authoring/codesandbox.mdx'),
      baseUrl,
      title: 'Test Title',
      url: '/authoring/codesandbox',
      tableOfContents: [],
      entries: [],
    })
    // `Img` is async, which only the streaming renderer waits for
    return renderToHtml(result.content)
  }

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('resolves a relative `img` like an `<img src>`, and reads its dimensions', async () => {
    vi.stubEnv('MDX', join(process.cwd(), 'docs'))
    vi.stubEnv('MDX_BASEURL', baseUrl)

    const html = await render('<Codesandbox id="3rjsl" img="cell-fracture.webp" />')
    expect(html).toContain(`src="${baseUrl}/authoring/cell-fracture.webp"`)
    expect(html).toContain('width="1200"')
    expect(html).toContain('height="630"')
    expect(html).toContain('href="https://codesandbox.io/s/3rjsl"')
  })

  it('leaves a full URL `img` as is', async () => {
    const html = await render('<Codesandbox id="3rjsl" img="https://example.com/a.png" />')
    expect(html).toContain('src="https://example.com/a.png"')
  })

  it('still takes the deprecated `screenshot_url`', async () => {
    const html = await render('<Codesandbox id="3rjsl" screenshot_url="a.png" />')
    expect(html).toContain(`src="${baseUrl}/authoring/a.png"`)
  })

  it('renders a placeholder linking to the sandbox without `img`', async () => {
    const html = await render('<Codesandbox id="3rjsl" title="Cell fracture" />')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('codesandbox.io/api')
    expect(html).toContain('href="https://codesandbox.io/s/3rjsl"')
    expect(html).toContain('lucide-codesandbox')
    expect(html).toContain('bg-surface-container')
  })
})

/**
 * A shell block of npm commands gets a tab per package manager. Rendered without hydration (as
 * the website's first paint, or the CLI's HTML), it shows the default, pnpm, one.
 */
describe('package managers', () => {
  const render = async (source: string) => {
    const result = await compileMdxContent(source, {
      relFilePath: '/test/file.mdx',
      absoluteFilePath: '/home/user/docs/test/file.mdx',
      title: 'Test Title',
      url: '/test/file',
      tableOfContents: [],
      entries: [],
    })
    return renderToHtml(result.content)
  }

  it('renders the tabs, showing the pnpm command', async () => {
    const html = await render('```bash\nnpm install three\n```')
    expect(html).toContain('role="tablist"')
    expect(html).toMatch(/<button[^>]*role="tab"[^>]*>pnpm<\/button>/)
    expect(html).toMatch(/<button[^>]*role="tab"[^>]*>bun<\/button>/)
    expect(html).toContain('pnpm add three')
  })

  it('renders other shell blocks as before', async () => {
    const html = await render('```bash\ncd my-app\n```')
    expect(html).not.toContain('role="tablist"')
    expect(html).toContain('code-highlight')
  })
})
