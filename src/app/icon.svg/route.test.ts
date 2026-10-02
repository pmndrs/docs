import { svg } from '@/utils/icon'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

// A few bytes standing in for an image: only their base64 matters here
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

let root: string

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'pmndrs-docs-icon-route-'))
  await writeFile(join(root, 'icon.png'), PNG)
  await writeFile(join(root, 'icon.txt'), 'not an image')
})

beforeEach(() => {
  vi.stubEnv('MDX', root)
  vi.stubEnv('ICON', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

afterAll(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('GET', () => {
  it('is a 404 without ICON', async () => {
    const res = await GET()
    expect(res.status).toBe(404)
  })

  it('serves an emoji ICON as the SVG svg() makes of it', async () => {
    vi.stubEnv('ICON', '🥑')
    const res = await GET()

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
    expect(await res.text()).toBe(svg('🥑'))
  })

  it('escapes an ICON text that is not valid XML as is', async () => {
    vi.stubEnv('ICON', '<&>')
    const res = await GET()

    expect(await res.text()).toContain('>&lt;&amp;&gt;</text>')
  })

  it('embeds an ICON path, local to MDX, as a data URI', async () => {
    vi.stubEnv('ICON', '/icon.png')
    const res = await GET()

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
    expect(await res.text()).toContain(`href="data:image/png;base64,${PNG.toString('base64')}"`)
  })

  it('fails on an ICON path of an unknown image type', async () => {
    vi.stubEnv('ICON', '/icon.txt')
    await expect(GET()).rejects.toThrow('unsupported image type')
  })

  it('fails on an ICON path that does not exist', async () => {
    vi.stubEnv('ICON', '/missing.png')
    await expect(GET()).rejects.toThrow('ENOENT')
  })
})
