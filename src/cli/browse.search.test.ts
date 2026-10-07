import { expect, test } from 'vitest'
import type { Lib, Page } from './browse.corpus'
import { matchingLines, search } from './browse.search'

const lib = (name: string): Lib => ({
  name,
  title: name,
  description: '',
  base: `https://pmndrs.github.io/${name}`,
})

const page = (name: string, path: string, title: string, body = ''): Page => ({
  lib: lib(name),
  path,
  title,
  body,
})

const pages = [
  page(
    'zustand',
    '/reference/apis/subscribe-with-selector',
    'subscribeWithSelector',
    'Fires a callback when the selected slice of state changes.',
  ),
  page(
    'zustand',
    '/learn/guides/updating-state',
    'Updating state',
    'Flat updates and nested ones.',
  ),
  page('drei', '/performances/instances', 'Instances', 'Draw thousands of meshes in one call.'),
  page('drei', '/controls/scroll-controls', 'ScrollControls', 'A scroll rig for r3f.'),
  page(
    'react-three-fiber',
    '/advanced/scaling-performance',
    'Scaling performance',
    'On demand rendering, and instanced meshes for repeated geometry.',
  ),
]

const titles = (query: string) => search(query, pages).map((page) => page.title)

test('a term is contained, never merely spelled out in order', () => {
  // The prototype ranked by subsequence, so `scroll` surfaced `subscribeWithSelector`
  expect(titles('scroll')).not.toContain('subscribeWithSelector')
  expect(titles('scroll')[0]).toBe('ScrollControls')
})

test('a title match outranks a passing mention in a body', () => {
  expect(titles('instanc')).toEqual(['Instances', 'Scaling performance'])
})

test('every term has to match, not just one of them', () => {
  expect(titles('drei instances')).toEqual(['Instances'])
  expect(titles('drei zustand')).toEqual([])
})

test('the leading term is what the order is by', () => {
  expect(titles('instances drei')[0]).toBe('Instances')
})

test('an empty query is the whole corpus, in its own order', () => {
  expect(titles('')).toEqual(pages.map((page) => page.title))
  expect(titles('   ')).toHaveLength(pages.length)
})

test('a library name is searchable', () => {
  expect(titles('zustand').sort()).toEqual(['Updating state', 'subscribeWithSelector'])
})

test('a search narrowed to one page answers with its matching lines', () => {
  const readme = page('drei', '/x', 'X', 'one\nthe scroll rig\nthree\nscroll and rig\n')

  expect(matchingLines(readme, 'scroll rig')).toEqual([
    { line: 2, text: 'the scroll rig' },
    { line: 4, text: 'scroll and rig' },
  ])
  expect(matchingLines(readme, '')).toEqual([])
})
