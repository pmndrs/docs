import { load } from 'cheerio'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { GET as getMarkdown } from './route'
import { GET as getFullMarkdown } from '../../llms-full.txt/route'

vi.mock('pmndrs-docs-config', () => ({
  default: {
    scope: {
      spacing: { '4': { value: '1rem' } },
      registry: { url: 'https://example.com/r/base.json', command: 'npx shadcn add base' },
    },
  },
}))

let root: string

afterEach(async () => {
  vi.unstubAllEnvs()
  if (root) await rm(root, { recursive: true, force: true })
})

test('exports the same resolved document through the page endpoint and llms-full without rewriting MDX', async () => {
  root = await mkdtemp(join(tmpdir(), 'docs-markdown-'))
  vi.stubEnv('MDX', root)
  vi.stubEnv('NEXT_PUBLIC_LIBNAME', 'Example')
  const source = `---
title: Spacing
---
## Tokens

| Token | Value |
| --- | --- |
| 4 | <code>{spacing['4'].value}</code> |

<a href={registry.url}>Registry</a>

<Code>{registry.command}</Code>

\`{spacing['4'].value}\`

\`\`\`tsx
const example = { value: 'literal', cdata: ']]>' }
\`\`\`
`
  const file = join(root, 'spacing.mdx')
  await writeFile(file, source)
  const response = await getMarkdown(new Request('https://example.com/spacing.md'), {
    params: Promise.resolve({ slug: ['spacing.md'] }),
  })
  const markdown = await response.text()
  expect(markdown).toContain('`1rem`')
  expect(markdown).toContain('[Registry](https://example.com/r/base.json)')
  expect(markdown).toContain('npx shadcn add base')
  expect(markdown).toContain("`{spacing['4'].value}`")
  expect(markdown).toContain("const example = { value: 'literal', cdata: ']]>' }")
  expect(markdown).toContain('## Tokens')
  expect(markdown).not.toContain('<Code>')
  expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
  const full = await (await getFullMarkdown()).text()
  const pages = load(full.slice(full.indexOf('<page ')), { xmlMode: true })
  expect(pages('page').text()).toContain(markdown.trim())
  expect(await readFile(file, 'utf8')).toBe(source)
})
