import { compileMDX } from 'next-mdx-remote/rsc'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { parseFile, remarkCodeFile } from './remarkCodeFile'

const dir = mkdtempSync(join(tmpdir(), 'remark-code-file-'))
writeFileSync(join(dir, 'dev.sh'), '#!/bin/sh\necho dev\n')

async function render(source: string) {
  const { content } = await compileMDX({
    source,
    options: { mdxOptions: { remarkPlugins: [remarkCodeFile(dir)] } },
  })
  return renderToStaticMarkup(content)
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
    const html = await render('```sh file="dev.sh"\nstale copy\n```')
    expect(html).toContain('#!/bin/sh\necho dev')
    expect(html).not.toContain('stale copy')
  })

  it('leaves a block without `file=` as it is', async () => {
    expect(await render('```sh\necho hi\n```')).toContain('echo hi')
  })

  it('fails on a file it cannot read', async () => {
    await expect(render('```sh file="missing.sh"\n```')).rejects.toThrow(/missing\.sh/)
  })
})

describe('remarkCodeFile, on a copy of the MDX folder', () => {
  it('resolves against the folder as written', async () => {
    const copy = mkdtempSync(join(tmpdir(), 'remark-code-file-copy-'))
    process.env.MDX = copy
    process.env.PMNDRS_MDX_SOURCE = dir
    try {
      const { content } = await compileMDX({
        source: '```sh file="dev.sh"\n```',
        options: { mdxOptions: { remarkPlugins: [remarkCodeFile(copy)] } },
      })
      expect(renderToStaticMarkup(content)).toContain('echo dev')
    } finally {
      delete process.env.MDX
      delete process.env.PMNDRS_MDX_SOURCE
    }
  })
})
