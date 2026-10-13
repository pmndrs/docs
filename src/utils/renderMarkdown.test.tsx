import type { ComponentType, ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './renderMarkdown'

describe('renderMarkdown', () => {
  it('evaluates scoped table cells, mapped rows, links and commands as Markdown', async () => {
    const source = [
      '# Foundations',
      '',
      '| Step | Value | Pixels |',
      '| --- | --- | --- |',
      '| `4` | <code>{spacing.value}</code> | {spacing.pixels}px |',
      '',
      '<table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name}><td>{row.name}</td><td><code>{row.value}</code></td></tr>)}</tbody></table>',
      '',
      '<Badge href={destination}>Open registry</Badge>',
      '',
      '<Code>{`npx add package#${release}`}</Code>',
      '',
      '![Preview](./preview.png)',
      '',
      '- Read the [guide](/guide).',
    ].join('\n')
    const markdown = await renderMarkdown(source, {
      config: {
        scope: {
          spacing: { value: '1rem', pixels: 16 },
          rows: [
            { name: 'gap', value: '2rem' },
            { name: 'size', value: '4rem' },
          ],
          destination: 'https://example.com/registry?version=1&format=json',
          release: 'v1.2.3',
        },
      },
      relFilePath: '/tokens/spacing.mdx',
      baseUrl: 'https://example.com/docs',
    })

    expect(markdown).toContain('# Foundations')
    expect(markdown).toMatch(/\| `4`\s*\| `1rem`\s*\| 16px\s*\|/)
    expect(markdown).toMatch(/\| gap\s*\| `2rem`\s*\|/)
    expect(markdown).toMatch(/\| size\s*\| `4rem`\s*\|/)
    expect(markdown).toMatch(
      /\[Open registry\]\(https:\/\/example\.com\/registry\?version=1\\?&format=json\)/,
    )
    expect(markdown).toContain('```\nnpx add package#v1.2.3\n```')
    expect(markdown).toContain('![Preview](https://example.com/docs/tokens/preview.png)')
    expect(markdown).toContain('- Read the [guide](/guide).')
    expect(markdown).not.toContain('{spacing.')
    expect(markdown).not.toContain('rows.map')
  })

  it('preserves literal code containing expressions, JSX and backticks', async () => {
    const code = [
      "import { Button } from './button'",
      'const template = `${spacing.value}`',
      'const fence = "```"',
      'const comment = "<!-- keep literal -->"',
      'export function Example() { return <Button>{value}</Button> }',
    ].join('\n')
    const source = [
      'Use `{spacing.value}` and `` `literal` {value} ``.',
      '',
      '````tsx',
      code,
      '````',
    ].join('\n')
    const markdown = await renderMarkdown(source, {
      config: { scope: { spacing: { value: '1rem' } } },
    })

    expect(markdown).toContain('`{spacing.value}`')
    expect(markdown).toContain('`` `literal` {value} ``')
    expect(markdown).toContain(`\n${code}\n`)
    expect(markdown).toMatch(/^`{4,}tsx\n/m)
    expect(markdown).not.toContain('1rem')
  })

  it('exports every tab, package-manager command, diagram and declared theme preset', async () => {
    const markdown = await renderMarkdown(
      [
        '<Tabs defaultValue="react">',
        '<TabsList><TabsTrigger value="react">React</TabsTrigger><TabsTrigger value="vue">Vue</TabsTrigger></TabsList>',
        '<TabsContent value="react">React instructions</TabsContent>',
        '<TabsContent value="vue">Vue instructions</TabsContent>',
        '</Tabs>',
        '',
        '<Code npm="npm install example" pnpm="pnpm add example" />',
        '',
        '<Mermaid chart={diagram} />',
        '',
        '<ThemeSeeds presets={presets} />',
        '',
        '<ColorGroup><Color role="primary" /><Color color="#abcdef" /></ColorGroup>',
      ].join('\n'),
      {
        config: {
          scope: {
            diagram: 'graph TD; A-->B;',
            presets: [
              {
                name: 'lime',
                label: 'Lime',
                config: { source: '#aabbcc', colorMatch: true, scheme: 'tonalSpot' },
              },
              {
                name: 'purple',
                label: 'Purple',
                config: { source: '#112233', colorMatch: false, scheme: 'expressive' },
              },
            ],
          },
        },
      },
    )

    expect(markdown).toContain('**React**')
    expect(markdown).toContain('**Vue**')
    expect(markdown).toContain('React instructions')
    expect(markdown).toContain('Vue instructions')
    expect(markdown).toContain('```sh\nnpm install example\n```')
    expect(markdown).toContain('```sh\npnpm add example\n```')
    expect(markdown).toContain('```mermaid\ngraph TD; A-->B;\n```')
    expect(markdown).toMatch(/\| Lime\s*\| `source`\s*\| `#aabbcc`\s*\|/)
    expect(markdown).toMatch(/\| Purple\s*\| `source`\s*\| `#112233`\s*\|/)
    expect(markdown).toContain('`expressive`')
    expect(markdown).not.toContain('tonalSpot')
    expect(markdown).toContain('`primary`')
    expect(markdown).toContain('`#abcdef`')
    expect(markdown).not.toContain('<Tabs')
  })

  it('awaits custom server components and permits a static alternative to an opaque client component', async () => {
    async function ServerValue({ value }: { value: string }) {
      const resolved = await Promise.resolve(value)
      return <strong>{resolved}</strong>
    }
    const Interactive = {
      $$typeof: Symbol.for('react.client.reference'),
    } as unknown as ComponentType<{ children?: ReactNode }>
    const config = {
      components: { ServerValue, Interactive },
      scope: { value: 'Resolved on server' },
    }
    const source = '<ServerValue value={value} />\n\n<Interactive>Authored fallback</Interactive>'
    const fallback = await renderMarkdown(source, { config })
    expect(fallback).toContain('**Resolved on server**')
    expect(fallback).toContain('Interactive: interactive content is available on the website.')
    expect(fallback).toContain('Authored fallback')

    const alternate = await renderMarkdown(source, {
      config: {
        ...config,
        markdownComponents: {
          Interactive: ({ children }: { children?: ReactNode }) => (
            <blockquote>Static representation: {children}</blockquote>
          ),
        },
      },
    })
    expect(alternate).toContain('> Static representation: Authored fallback')
    expect(alternate).not.toContain('interactive content is available')
  })

  it('rejects unresolved scope expressions instead of silently exporting source or empty content', async () => {
    await expect(renderMarkdown('| Value |\n| --- |\n| {missing.value} |')).rejects.toThrow(
      /missing/,
    )
    await expect(renderMarkdown('<MissingComponent />')).rejects.toThrow(/MissingComponent/)
  })

  it('omits executable and decorative HTML without losing surrounding article text', async () => {
    const markdown = await renderMarkdown(
      [
        'Before the illustration.',
        '',
        '<script>{"window.secret = \'script sentinel\'"}</script>',
        '',
        '<style>{".private { content: \'style sentinel\' }"}</style>',
        '',
        '<svg aria-hidden="true"><title>svg sentinel</title><text>decorative text</text><path d="M0 0L1 1" /></svg>',
        '',
        'After the illustration.',
      ].join('\n'),
    )

    expect(markdown).toContain('Before the illustration.')
    expect(markdown).toContain('After the illustration.')
    expect(markdown).not.toContain('sentinel')
    expect(markdown).not.toContain('decorative text')
    expect(markdown).not.toContain('<script')
    expect(markdown).not.toContain('<svg')
  })
})
