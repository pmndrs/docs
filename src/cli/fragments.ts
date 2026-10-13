import { load } from 'cheerio'
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { withNextExport } from './website'

const imageTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

/** Rewrites candidate URLs without splitting commas inside data or ordinary URLs. */
async function rewriteSrcset(srcset: string, rewrite: (url: string) => Promise<string>) {
  let position = 0
  let copied = 0
  let result = ''
  while (position < srcset.length) {
    // The HTML candidate parser skips leading commas and ASCII whitespace, then reads
    // a URL up to whitespace. Only trailing URL commas separate descriptorless candidates.
    while (position < srcset.length && /[\t\n\f\r ,]/.test(srcset[position])) position++
    const start = position
    while (position < srcset.length && !/[\t\n\f\r ]/.test(srcset[position])) position++
    let end = position
    while (end > start && srcset[end - 1] === ',') end--
    if (end === start) continue

    result += srcset.slice(copied, start) + (await rewrite(srcset.slice(start, end)))
    copied = end
    if (end < position) continue

    // Keep descriptors verbatim; a comma outside parentheses starts the next candidate.
    let parentheses = 0
    while (position < srcset.length) {
      const character = srcset[position++]
      if (character === '(') parentheses++
      else if (character === ')' && parentheses > 0) parentheses--
      else if (character === ',' && parentheses === 0) break
    }
  }
  return result + srcset.slice(copied)
}

/**
 * Extracts the document rendered by Next, keeping imported images usable without `_next`.
 *
 * @param html - A page from the completed static export.
 * @param exportDir - Root of that export, containing Next's emitted media files.
 * @param basePath - URL prefix used by the build.
 */
export async function extractFragment(html: string, exportDir: string, basePath = '') {
  const $ = load(html)
  const content = $('body > [data-pmndrs-fragment]')
  if (!content.length) return null

  content.find('script, style, link').remove()
  const prefix = `${basePath}/_next/static/media/`
  async function embedImage(src: string) {
    if (!src.startsWith(prefix)) return src
    const mediaDir = join(exportDir, '_next/static/media')
    const file = resolve(mediaDir, decodeURIComponent(src.slice(prefix.length)))
    const path = relative(mediaDir, file)
    if (path.startsWith(`..${sep}`) || path === '..') {
      throw new Error(`Image escapes the exported media directory: ${src}`)
    }
    const mime = imageTypes[extname(file)]
    if (!mime) throw new Error(`Unsupported exported image: ${src}`)
    const data = await readFile(file)
    return `data:${mime};base64,${data.toString('base64')}`
  }
  for (const image of content.find('img[src]').toArray()) {
    $(image).attr('src', await embedImage($(image).attr('src')!))
  }
  for (const image of content.find('img[srcset], source[srcset]').toArray()) {
    $(image).attr('srcset', await rewriteSrcset($(image).attr('srcset')!, embedImage))
  }

  return content.html() ?? ''
}

/** Files under a directory, pruning dependencies and an optional output subtree. */
async function filesIn(root: string, exclude?: string): Promise<string[]> {
  const files: string[] = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (path === exclude || entry.name === 'node_modules') continue
    if (entry.isDirectory()) files.push(...(await filesIn(path, exclude)))
    else if (entry.isFile() || entry.isSymbolicLink()) files.push(path)
  }
  return files
}

type FragmentOptions = {
  /** Installed package or checkout containing the Next application. */
  packageRoot: string
  /** Configuration shared with website builds. */
  env: Record<string, string | undefined>
}

/**
 * Builds one document through Next and returns its standalone HTML body.
 *
 * @param source - MDX including frontmatter.
 * @param options - Build configuration and original source path for relative references.
 */
export async function renderFragment(
  source: string,
  { absoluteFilePath, ...options }: FragmentOptions & { absoluteFilePath: string },
) {
  return withNextExport(
    { ...options, fragments: true, source: { content: source, absoluteFilePath } },
    async (exportDir) => {
      const html = await extractFragment(
        await readFile(join(exportDir, 'index.html'), 'utf8'),
        exportDir,
        options.env.BASE_PATH,
      )
      if (html === null) throw new Error('Next export is missing the document fragment')
      return html
    },
  )
}

/**
 * Exports a folder through Next, writing one HTML fragment per document and copying assets.
 */
export async function buildFragments({
  root,
  outDir,
  ...options
}: FragmentOptions & { root: string; outDir: string }) {
  if (root === outDir || root.startsWith(`${outDir}${sep}`)) {
    throw new Error('The output folder must not contain the input folder')
  }
  const inputs = await filesIn(root, outDir)
  const copyAssets = async () => {
    await mkdir(outDir, { recursive: true })
    for (const path of inputs) {
      if (/\.mdx?$/.test(path)) continue
      const file = join(outDir, relative(root, path))
      await mkdir(dirname(file), { recursive: true })
      await copyFile(path, file)
    }
  }
  // No document means no rendering work, but an assets-only folder is still valid input.
  if (!inputs.some((path) => /\.mdx?$/.test(path))) {
    await copyAssets()
    return 0
  }
  return withNextExport(
    { ...options, env: { ...options.env, MDX: root }, fragments: true },
    async (exportDir) => {
      let count = 0
      const documentsDir = join(exportDir, 'fragments')
      for (const path of await filesIn(documentsDir)) {
        if (!path.endsWith('.html')) continue
        const html = await extractFragment(
          await readFile(path, 'utf8'),
          exportDir,
          options.env.BASE_PATH,
        )
        if (html === null) continue
        const file = join(outDir, relative(documentsDir, path))
        await mkdir(dirname(file), { recursive: true })
        await writeFile(file, html)
        count++
      }
      await copyAssets()
      return count
    },
  )
}
