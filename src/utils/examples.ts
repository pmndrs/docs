/**
 * Reads the catalog that pmndrs/examples publishes alongside its website
 * (`bin/build-catalog.mjs` there), so the MCP server can serve the example
 * gallery next to the docs.
 *
 * The docs are page dumps parsed out of one `llms-full.txt` per library; the
 * examples are not. They arrive as JSON, already split into an index and one
 * file per example, so nothing here has to parse or slice a bundle -- it only
 * has to render the pieces as the text an agent reads.
 */

/**
 * Where the gallery lives. Overridable so the MCP server can be developed against
 * a local `pnpm build` of pmndrs/examples -- the catalog only exists once that
 * repo has built, and pointing at production while changing its shape tests the
 * old shape.
 */
export const EXAMPLES_URL = process.env.EXAMPLES_URL || 'https://pmndrs.github.io/examples'

/** Every published example is a kebab-case directory name. Anything else is a typo. */
const EXAMPLE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * `index` is legal kebab-case and sits in the same directory, so it would fetch
 * the index and then be rendered as an example that has no title and no files.
 */
const RESERVED_NAME = 'index'

export interface ExampleSummary {
  name: string
  title: string
  description: string
  tags: string[]
  authors: string[]
  publishedAt?: string
  notes?: string
  libraries: string[]
  source: string
  demo: string
  thumbnail: string
  bytes: number
}

export interface ExampleIndex {
  site: string
  count: number
  examples: ExampleSummary[]
}

export interface Example extends ExampleSummary {
  repository: string
  install: string
  dependencies: Record<string, string>
  files: { path: string; content: string }[]
  binaries: string[]
  oversized: { path: string; bytes: number }[]
  assets: {
    name: string
    files?: string[]
    creator?: string
    source?: string
    license?: string
    licenseUrl?: string
    modified?: boolean
    notes?: string
  }[]
}

/**
 * Every example depends on these, so spelling them out on 167 index lines says
 * nothing. The per-example view lists the real dependencies, versions included.
 */
const IMPLIED_LIBRARIES = new Set(['@react-three/fiber', '@react-three/drei'])

const SHORT_LIBRARY_NAMES: Record<string, string> = {
  '@react-spring/core': 'react-spring',
  '@react-spring/three': 'react-spring',
  '@react-spring/web': 'react-spring',
  '@use-gesture/react': 'use-gesture',
}

const shortenLibrary = (library: string) =>
  SHORT_LIBRARY_NAMES[library] ?? library.replace(/^@react-three\//, '')

const titleCase = (name: string) =>
  name
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')

export function catalogUrl(file: string, base = EXAMPLES_URL) {
  return `${base}/catalog/${file}.json`
}

export function assertExampleName(name: string) {
  if (!EXAMPLE_NAME.test(name) || name === RESERVED_NAME) {
    throw new Error(`Not an example name: ${name}`)
  }
  return name
}

/**
 * Where an example stops being cheap. The median is 5 kB and nine tenths are
 * under 15 kB, so reading three of them costs less than this index does -- the
 * size is worth saying only for the handful where it changes the decision.
 * Eight examples are over this line; two of them are most of the distance.
 */
const LARGE_BYTES = 24 * 1024

/**
 * One index line. Everything past the name is optional and omitted when the
 * example does not carry it, so an entry costs what it is worth -- and a line
 * with no size marker is one you can open without thinking about it:
 *
 *     aquarium · #transmission
 *     arkanoid · Simple arkanoid implementation using cannon physics. · +cannon,zustand · #physics,game
 *     bounds-and-makedefault (Bounds and makeDefault) · #bounds
 *     flow-shield · Interactive energy shield. · +postprocessing,leva · #shader · ~23k
 */
export function summaryLine({ name, title, description, libraries, tags, bytes }: ExampleSummary) {
  // A title that is just the prettified directory name is noise -- but not
  // always: `makeDefault`, `GLTF`, `Bruno Simon's` only exist in the title.
  const head = title && title !== titleCase(name) ? `${name} (${title})` : name

  const extras = [
    ...new Set(libraries.filter((l) => !IMPLIED_LIBRARIES.has(l)).map(shortenLibrary)),
  ]

  return [
    head,
    description.trim().replace(/\s+/g, ' '),
    extras.length ? `+${extras.join(',')}` : '',
    tags.length ? `#${tags.join(',')}` : '',
    bytes > LARGE_BYTES ? `~${Math.round(bytes / 4000)}k` : '',
  ]
    .filter(Boolean)
    .join(' · ')
}

export function renderIndex({ examples }: ExampleIndex) {
  return examples.map(summaryLine).join('\n')
}

const FENCE_LANGUAGES: Record<string, string> = {
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.js': 'js',
  '.jsx': 'jsx',
  '.mjs': 'js',
  '.cjs': 'js',
  '.css': 'css',
  '.json': 'json',
  '.glsl': 'glsl',
  '.vert': 'glsl',
  '.frag': 'glsl',
}

/** A fence long enough to survive whatever backticks the file itself contains. */
function fence(content: string) {
  const longest = Math.max(0, ...(content.match(/`+/g) ?? []).map((run) => run.length))
  return '`'.repeat(Math.max(3, longest + 1))
}

function attribution(assets: Example['assets']) {
  return assets
    .map((asset) => {
      const parts = [asset.name]
      if (asset.creator) parts.push(`by ${asset.creator}`)
      if (asset.license) parts.push(asset.license)
      if (asset.modified) parts.push('modified')
      const line = `- ${parts.join(' — ')}`
      return asset.source || asset.licenseUrl
        ? `${line} (${asset.source ?? asset.licenseUrl})`
        : line
    })
    .join('\n')
}

/**
 * The whole example as one document: what it is, what it pins, then its source.
 * Versions are part of the answer -- the code is written against the `three` and
 * drei that sit next to it, and reading it without them invites an API that
 * moved.
 */
export function renderExample(example: Example) {
  const facts = [
    `Demo: ${example.demo}`,
    `Source: ${example.repository}`,
    `Scaffold: ${example.install}`,
    example.publishedAt && `Published: ${example.publishedAt}`,
    example.authors.length && `Authors: ${example.authors.join(', ')}`,
    example.tags.length && `Tags: ${example.tags.join(', ')}`,
    `Ported from: ${example.source}`,
    `Dependencies: ${Object.entries(example.dependencies)
      .map(([name, version]) => `${name}@${version}`)
      .join(', ')}`,
    example.binaries.length &&
      `Binary files, in the repository but not below: ${example.binaries.join(', ')}`,
    // Vendored bundles, font atlases, gltfjsx dumps. Named rather than hidden:
    // a reader that finds an unexplained import wants to know it was skipped on
    // size, not wonder whether the example is broken.
    example.oversized.length &&
      `Too large to inline, in the repository: ${example.oversized
        .map(({ path, bytes }) => `${path} (${Math.round(bytes / 1024)} kB)`)
        .join(', ')}`,
  ].filter(Boolean)

  const sections = [
    `# ${example.title}`,
    example.description.trim(),
    facts.join('\n'),
    example.notes?.trim(),
    example.assets.length && `## Asset attribution\n\n${attribution(example.assets)}`,
    ...example.files.map((file) => {
      const language = FENCE_LANGUAGES[file.path.slice(file.path.lastIndexOf('.'))] ?? ''
      const marks = fence(file.content)
      return `## ${file.path}\n\n${marks}${language}\n${file.content.trimEnd()}\n${marks}`
    }),
  ].filter(Boolean)

  return sections.join('\n\n')
}
