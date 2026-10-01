import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { dynamicParams, generateStaticParams, GET } from './route'

let root: string
let previousMDX: string | undefined

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'pmndrs-docs-md-route-'))
  await mkdir(join(root, 'getting-started'))
  await writeFile(
    join(root, 'getting-started', 'introduction.mdx'),
    `---
title: Introduction
description: Where it all starts.
nav: 0
---

Some **markdown** body.
`,
  )
  await writeFile(join(root, 'faq.md'), 'No frontmatter here.\n')

  previousMDX = process.env.MDX
  process.env.MDX = root
})

afterAll(async () => {
  process.env.MDX = previousMDX
  await rm(root, { recursive: true, force: true })
})

function get(slug: string[]) {
  return GET(new Request(`http://localhost/md/${slug.join('/')}`), {
    params: Promise.resolve({ slug }),
  })
}

describe('generateStaticParams', () => {
  it('lists every page, with the .md suffix on its last segment', async () => {
    const params = await generateStaticParams()
    expect(params).toEqual([{ slug: ['getting-started', 'introduction.md'] }, { slug: ['faq.md'] }])
  })
})

describe('dynamicParams', () => {
  it('is false, so Next 404s on any path generateStaticParams did not list', () => {
    // At runtime on Vercel `MDX` is unset, and GET would throw a 500 before it could 404
    expect(dynamicParams).toBe(false)
  })
})

describe('GET', () => {
  it('returns the page as markdown: title, description, then the body', async () => {
    const res = await get(['getting-started', 'introduction.md'])

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    expect(await res.text()).toBe(`# Introduction

Where it all starts.

Some **markdown** body.
`)
  })

  it('skips the description when the page has none', async () => {
    const res = await get(['faq.md'])

    expect(res.status).toBe(200)
    expect(await res.text()).toBe(`# faq

No frontmatter here.
`)
  })

  it('404s on a page that does not exist', async () => {
    const res = await get(['getting-started', 'nope.md'])
    expect(res.status).toBe(404)
  })

  it('404s without the .md suffix', async () => {
    const res = await get(['getting-started', 'introduction'])
    expect(res.status).toBe(404)
  })
})
