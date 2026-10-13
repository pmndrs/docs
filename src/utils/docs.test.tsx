import { renderFragment, renderToHtml } from '@/cli/render'
import type { DocsConfig } from '@/config'
import { load } from 'cheerio'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ComponentProps } from 'react'
import { afterEach, expect, test } from 'vitest'
import { getDocs } from './docs'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

const foundations = { spacing: { scale: [{ name: 'small', value: 4 }] } }

const config = {
  components: {
    async FoundationTable({ rows }: { rows: typeof foundations.spacing.scale }) {
      const resolvedRows = await Promise.resolve(rows)
      return (
        <table data-foundation="spacing">
          <tbody>
            {resolvedRows.map((row) => (
              <tr key={row.name} data-token={row.name} data-value={row.value}>
                <td>{row.name}</td>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    },
    h1: (props: ComponentProps<'h1'>) => <h1 {...props} data-consumer-heading />,
  },
  scope: { foundations },
} satisfies DocsConfig

test('renders structured scope through a consumer component without changing the MDX source', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pmndrs-docs-config-'))
  roots.push(root)
  const file = join(root, 'spacing.mdx')
  const source = '---\ntitle: Spacing\n---\n\n<FoundationTable rows={foundations.spacing.scale} />'
  await writeFile(file, source)

  const docs = await getDocs(root, ['spacing'], false, config)
  expect(docs).toHaveLength(1)
  expect(docs[0].url).toBe('/spacing')
  const $ = load(await renderToHtml(docs[0].content))
  expect($('table[data-foundation="spacing"] tr[data-token="small"]').attr('data-value')).toBe('4')
  expect($('h1[data-consumer-heading]')).toHaveLength(1)
  expect(await readFile(file, 'utf8')).toBe(source)
})

test('uses the same consumer components and scope in standalone fragments', async () => {
  const $ = load(
    await renderFragment(
      '---\ntitle: Spacing\n---\n\n<FoundationTable rows={foundations.spacing.scale} />',
      { absoluteFilePath: '/docs/spacing.mdx', config },
    ),
  )
  expect($('table[data-foundation="spacing"] tr[data-token="small"]').attr('data-value')).toBe('4')
  expect($('h1[data-consumer-heading]')).toHaveLength(1)
})

test('retains built-in components when a repository supplies no configuration', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pmndrs-docs-default-'))
  roots.push(root)
  await writeFile(join(root, 'index.mdx'), '---\ntitle: Home\n---\n\n## Getting started\n\n- Item')

  const docs = await getDocs(root, ['index'])
  const $ = load(await renderToHtml(docs[0].content))
  expect($('h2').attr('id')).toBe('getting-started')
  expect($('ul li')).toHaveLength(1)
  expect($('h1')).toHaveLength(0)
})
