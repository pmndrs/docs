// PROTOTYPE — throwaway. See browse.prototype.tsx.
//
// The corpus layer, shared by all three variants: fetch a library's
// `llms-full.txt` once, split it into pages, cache it on disk.
//
// NOTE: the real registry lives in `src/app/page.tsx`, but it imports Next
// assets (`@/assets/*.svg`, `next/image`), so a plain node process cannot read
// it. Duplicated here on purpose — extracting it to a plain module is one of
// the findings this prototype is meant to surface.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface Lib {
  name: string
  title: string
  docs_url: string
  description: string
}

export interface Page {
  lib: Lib
  path: string
  title: string
  body: string
}

// Only the libs whose site ships an `llms-full.txt` (`llms_full: true` in the
// real registry) can be read at all.
export const libs: Lib[] = [
  {
    name: 'react-three-fiber',
    title: 'React Three Fiber',
    docs_url: 'https://pmndrs.github.io/react-three-fiber',
    description: 'A React renderer for three.js',
  },
  {
    name: 'drei',
    title: 'Drei',
    docs_url: 'https://pmndrs.github.io/drei',
    description: 'Useful helpers and abstractions for react-three-fiber',
  },
  {
    name: 'zustand',
    title: 'Zustand',
    docs_url: 'https://pmndrs.github.io/zustand',
    description: 'A small, fast and scalable bearbones state-management solution',
  },
]

const cacheDir = join(homedir(), '.cache', 'pmndrs-docs-PROTOTYPE-wipe-me')

async function dump(lib: Lib): Promise<string> {
  const cached = join(cacheDir, `${lib.name}.txt`)
  try {
    return readFileSync(cached, 'utf8')
  } catch {
    // not cached yet
  }

  const response = await fetch(`${lib.docs_url}/llms-full.txt`, { redirect: 'follow' })
  if (!response.ok) throw new Error(`${lib.name}: ${response.status} ${response.statusText}`)
  const text = await response.text()

  mkdirSync(cacheDir, { recursive: true })
  writeFileSync(cached, text)
  return text
}

const PAGE = /<page path="([^"]*)" title="([^"]*)"><!\[CDATA\[([\s\S]*?)\]\]><\/page>/g

export async function pagesOf(lib: Lib): Promise<Page[]> {
  const text = await dump(lib)
  return [...text.matchAll(PAGE)].map(([, path, title, body]) => ({ lib, path, title, body }))
}

export async function corpus(): Promise<Page[]> {
  const all = await Promise.all(libs.map(pagesOf))
  return all.flat()
}

export function webUrl(page: Page): string {
  return `${page.lib.docs_url}${page.path}`
}
