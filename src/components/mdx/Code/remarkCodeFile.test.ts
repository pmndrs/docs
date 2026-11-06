import type { Code, Root } from 'mdast'
import { compileMDX } from 'next-mdx-remote/rsc'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { visit } from 'unist-util-visit'
import { afterAll, describe, expect, it } from 'vitest'
import { parseFile, remarkCodeFile } from './remarkCodeFile'

const dir = mkdtempSync(join(tmpdir(), 'remark-code-file-'))
writeFileSync(join(dir, 'dev.sh'), '#!/bin/sh\necho dev\n')
writeFileSync(join(dir, 'crlf.sh'), 'echo one\r\necho two\r\n')

// A repository, `.git` and all, with a page inside and a file beside it
const outside = mkdtempSync(join(tmpdir(), 'remark-code-file-outside-'))
const repo = join(outside, 'repo')
const page = join(repo, 'docs')
mkdirSync(join(repo, '.git'), { recursive: true })
mkdirSync(page)
writeFileSync(join(repo, 'dev.sh'), 'echo repo\n')
writeFileSync(join(outside, 'secret.sh'), 'echo secret\n')

afterAll(() => {
  for (const folder of [dir, outside]) rmSync(folder, { recursive: true, force: true })
})

/**
 * Compiles a page of `folder`, keeping the code nodes as the plugin leaves them.
 */
async function render(source: string, folder = dir) {
  const codes: Code[] = []
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [
          remarkCodeFile(folder),
          () => (tree: Root) => visit(tree, 'code', (node) => void codes.push({ ...node })),
        ],
      },
    },
  })
  return { html: renderToStaticMarkup(content), codes }
}

describe('parseFile', () => {
  it('reads a double- or single-quoted file', () => {
    expect(parseFile('file="../../dev.sh"')).toBe('../../dev.sh')
    expect(parseFile("file='dev.sh'")).toBe('dev.sh')
  })

  it('reads it among other meta', () => {
    expect(parseFile('{2} title="dev.sh" file="dev.sh" collapsible')).toBe('dev.sh')
    expect(parseFile('{2}file="dev.sh"')).toBe('dev.sh')
  })

  it('is undefined without one', () => {
    expect(parseFile('title="dev.sh"')).toBeUndefined()
    expect(parseFile('profile="dev.sh"')).toBeUndefined()
    expect(parseFile(undefined)).toBeUndefined()
  })
})

describe('remarkCodeFile', () => {
  it('fills the block with the file, replacing what the fence holds', async () => {
    const { html } = await render('```sh file="dev.sh"\nstale copy\n```')
    expect(html).toContain('#!/bin/sh\necho dev')
    expect(html).not.toContain('stale copy')
  })

  it('leaves a block without `file=` as it is', async () => {
    const { html, codes } = await render('```sh title="x.sh"\necho hi\n```')
    expect(html).toContain('echo hi')
    expect(codes[0]?.meta).toBe('title="x.sh"')
  })

  it('fails on a file it cannot read', async () => {
    await expect(render('```sh file="missing.sh"\n```')).rejects.toThrow(/missing\.sh/)
  })

  it('drops the trailing line break of a CRLF file', async () => {
    const { codes } = await render('```sh file="crlf.sh"\n```')
    expect(codes[0]?.value).toBe('echo one\r\necho two')
  })

  it('keeps the rest of the meta, without `file=`', async () => {
    const { codes } = await render('```sh {2} title="x.sh" file="dev.sh" collapsible\n```')
    expect(codes[0]?.meta).toBe('{2} title="x.sh" collapsible')
    expect((await render('```sh file="dev.sh"\n```')).codes[0]?.meta).toBeNull()
  })
})

describe('remarkCodeFile, in a repository', () => {
  it('reads a file of the repository, out of the page folder', async () => {
    expect((await render('```sh file="../dev.sh"\n```', page)).html).toContain('echo repo')
    const absolute = join(repo, 'dev.sh')
    expect((await render(`\`\`\`sh file="${absolute}"\n\`\`\``, page)).html).toContain('echo repo')
  })

  it('refuses a file out of the repository', async () => {
    await expect(render('```sh file="../../secret.sh"\n```', page)).rejects.toThrow(
      `file="../../secret.sh" is outside the repository holding the page: ${repo}`,
    )
  })
})
