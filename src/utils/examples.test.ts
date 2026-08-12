import { describe, it, expect } from 'vitest'
import {
  assertExampleName,
  catalogUrl,
  renderExample,
  renderIndex,
  summaryLine,
  type Example,
  type ExampleSummary,
} from './examples'

const summary = (over: Partial<ExampleSummary> = {}): ExampleSummary => ({
  name: 'caustics',
  title: 'Caustics',
  description: '',
  tags: [],
  authors: ['Paul Henschel'],
  libraries: ['@react-three/drei', '@react-three/fiber'],
  source: 'https://codesandbox.io/s/szj6p7',
  demo: 'https://pmndrs.github.io/examples/examples/caustics',
  thumbnail: 'https://pmndrs.github.io/examples/caustics/thumbnail.webp',
  ...over,
})

const example = (over: Partial<Example> = {}): Example => ({
  ...summary(),
  repository: 'https://github.com/pmndrs/examples/tree/main/examples/caustics',
  install: 'npx degit pmndrs/examples/examples/caustics',
  dependencies: { '@react-three/drei': '10.7.8', three: '0.165.0' },
  files: [{ path: 'src/App.tsx', content: 'export default function App() {}' }],
  binaries: [],
  oversized: [],
  assets: [],
  ...over,
})

describe('summaryLine', () => {
  it('drops a title that is just the prettified name', () => {
    expect(summaryLine(summary())).toBe('caustics')
  })

  it('keeps a title that carries something the name cannot', () => {
    expect(
      summaryLine(summary({ name: 'bounds-and-makedefault', title: 'Bounds and makeDefault' })),
    ).toBe('bounds-and-makedefault (Bounds and makeDefault)')
  })

  it('omits fiber and drei, which every example uses', () => {
    const line = summaryLine(
      summary({
        libraries: ['@react-three/fiber', '@react-three/drei', '@react-three/cannon', 'zustand'],
      }),
    )

    expect(line).toBe('caustics · +cannon,zustand')
  })

  it('collapses the react-spring entry points into one name', () => {
    const line = summaryLine(
      summary({ libraries: ['@react-spring/three', '@react-spring/web', '@react-spring/core'] }),
    )

    expect(line).toBe('caustics · +react-spring')
  })

  it('assembles description, libraries and tags in that order', () => {
    const line = summaryLine(
      summary({
        name: 'arkanoid',
        title: 'Arkanoid',
        description: 'Simple arkanoid implementation using cannon physics.',
        libraries: ['@react-three/fiber', '@react-three/cannon'],
        tags: ['physics', 'game'],
      }),
    )

    expect(line).toBe(
      'arkanoid · Simple arkanoid implementation using cannon physics. · +cannon · #physics,game',
    )
  })

  it('flattens a description that wraps', () => {
    const line = summaryLine(summary({ description: 'One idea,\n  spread over lines.' }))

    expect(line).toBe('caustics · One idea, spread over lines.')
  })
})

describe('renderIndex', () => {
  it('is one line per example', () => {
    const text = renderIndex({
      site: 'https://pmndrs.github.io/examples',
      count: 2,
      examples: [summary(), summary({ name: 'aquarium', title: 'Aquarium', tags: ['water'] })],
    })

    expect(text).toBe('caustics\naquarium · #water')
  })
})

describe('assertExampleName', () => {
  it('passes the shape every published example has', () => {
    expect(assertExampleName('gltfjsx-400kb-drone')).toBe('gltfjsx-400kb-drone')
  })

  it.each(['../../etc/passwd', 'Caustics', 'a b', 'caustics/../index', '', 'caustics?x=1'])(
    'rejects %j before it can reach a URL',
    (name) => {
      expect(() => assertExampleName(name)).toThrow(/Not an example name/)
    },
  )

  it('rejects "index", which is the one name that collides with the catalog itself', () => {
    // Legal kebab-case, same directory: it would fetch the index and then be
    // rendered as an example with no title and no files.
    expect(() => assertExampleName('index')).toThrow(/Not an example name/)
  })

  it('puts a name where the catalog publishes it', () => {
    expect(catalogUrl('caustics')).toBe('https://pmndrs.github.io/examples/catalog/caustics.json')
  })
})

describe('renderExample', () => {
  it('leads with the title and the facts a reader needs', () => {
    const text = renderExample(example({ description: 'Glass, and what it does to light.' }))

    expect(text).toContain('# Caustics')
    expect(text).toContain('Glass, and what it does to light.')
    expect(text).toContain('Demo: https://pmndrs.github.io/examples/examples/caustics')
    expect(text).toContain('Scaffold: npx degit pmndrs/examples/examples/caustics')
    expect(text).toContain('Dependencies: @react-three/drei@10.7.8, three@0.165.0')
  })

  it('omits the facts an example does not carry', () => {
    const text = renderExample(example({ authors: [], tags: [] }))

    expect(text).not.toContain('Authors:')
    expect(text).not.toContain('Tags:')
  })

  it('fences each file under its own path, tagged by extension', () => {
    const text = renderExample(
      example({
        files: [
          { path: 'src/App.tsx', content: 'const a = 1' },
          { path: 'src/styles.css', content: 'body { margin: 0 }' },
        ],
      }),
    )

    expect(text).toContain('## src/App.tsx\n\n```tsx\nconst a = 1\n```')
    expect(text).toContain('## src/styles.css\n\n```css\nbody { margin: 0 }\n```')
  })

  it('opens a longer fence than the backticks inside the file', () => {
    // A file whose comments quote code would otherwise close the block early and
    // hand the reader half a file plus whatever followed it as prose.
    const text = renderExample(
      example({ files: [{ path: 'src/App.tsx', content: '// ```tsx\nconst a = 1' }] }),
    )

    expect(text).toContain('````tsx\n// ```tsx\nconst a = 1\n````')
  })

  it('names the binaries rather than pretending they are not there', () => {
    const text = renderExample(example({ binaries: ['src/glass-transformed.glb'] }))

    expect(text).toContain('src/glass-transformed.glb')
  })

  it('says which files were skipped on size, and how big they are', () => {
    const text = renderExample(
      example({ oversized: [{ path: 'src/realism-effects/v2.js', bytes: 256656 }] }),
    )

    expect(text).toContain(
      'Too large to inline, in the repository: src/realism-effects/v2.js (251 kB)',
    )
  })

  it('carries asset attribution through', () => {
    const text = renderExample(
      example({
        assets: [
          {
            name: 'Fruit Cake Slice',
            creator: 'matousekfoto',
            license: 'CC-BY-4.0',
            source: 'https://sketchfab.com/3d-models/fruit-cake-slice',
          },
        ],
      }),
    )

    expect(text).toContain('## Asset attribution')
    expect(text).toContain(
      '- Fruit Cake Slice — by matousekfoto — CC-BY-4.0 (https://sketchfab.com/3d-models/fruit-cake-slice)',
    )
  })
})
