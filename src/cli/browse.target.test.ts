import { expect, test } from 'vitest'
import type { Lib, Page } from './browse.corpus'
import { resolveTarget } from './browse.target'

const lib = (name: string): Lib => ({
  name,
  title: name,
  description: '',
  base: `https://pmndrs.github.io/${name}`,
})

const page = (name: string, path: string, title: string): Page => ({
  lib: lib(name),
  path,
  title,
  body: '',
})

const pages = [
  page('drei', '/performances/instances', 'Instances'),
  page('drei', '/getting-started/introduction', 'Introduction'),
  page('zustand', '/getting-started/introduction', 'Introduction'),
  page('zustand', '/reference/apis/create', 'create'),
]

test('a library name lands in that library', () => {
  expect(resolveTarget('drei', pages)).toMatchObject({ kind: 'lib', lib: { name: 'drei' } })
  expect(resolveTarget('drei/', pages)).toMatchObject({ kind: 'lib' })
  expect(resolveTarget('DREI', pages)).toMatchObject({ kind: 'lib', lib: { name: 'drei' } })
})

test('a library and a path open the page', () => {
  expect(resolveTarget('drei/performances/instances', pages)).toMatchObject({
    kind: 'page',
    page: { title: 'Instances' },
  })
})

test('a bare path opens the page when only one library has it', () => {
  expect(resolveTarget('/reference/apis/create', pages)).toMatchObject({
    kind: 'page',
    page: { title: 'create' },
  })
})

test('a bare path two libraries share stays a query, rather than picking one', () => {
  expect(resolveTarget('/getting-started/introduction', pages)).toMatchObject({ kind: 'query' })
})

test('a path that does not resolve is a query inside its library', () => {
  expect(resolveTarget('drei/perf', pages)).toMatchObject({
    kind: 'query',
    query: 'perf',
    lib: { name: 'drei' },
  })
})

test('anything else is a query over everything', () => {
  expect(resolveTarget('instanced mesh', pages)).toEqual({ kind: 'query', query: 'instanced mesh' })
  expect(resolveTarget('   ', pages)).toEqual({ kind: 'query', query: '' })
})
