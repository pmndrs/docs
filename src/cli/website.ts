import { resolveDocsConfig } from '../config.resolve'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

/** Published application files needed by a Next build. */
const APP_FILES = [
  'package.json',
  'next.config.mts',
  'next-env.d.ts',
  'postcss.config.mjs',
  'tsconfig.json',
  'public',
  'registry',
  'src',
]

/** The path scanned by the stylesheet's static Tailwind @source declaration. */
const MDX_DIR = 'docs'

/** Parent of the temporary application copies. */
const WORK_DIR = '.pmndrs-docs'

/**
 * Finds a writable project location outside the installed package's node_modules directory.
 * Next must remain resolvable by walking up from the copy, including under npx installations.
 * @param packageRoot - Installed package or checkout containing the application.
 */
function findWorkDir(packageRoot: string) {
  for (let dir = packageRoot; ; dir = dirname(dir)) {
    if (existsSync(join(dir, 'node_modules', 'next'))) return join(dir, WORK_DIR)
    if (dirname(dir) === dir) return null
  }
}

/** Dynamic MCP routes and development-only modules do not belong in a static export. */
const isExcluded = (path: string) =>
  /\.(test|stories)\.[jt]sx?$/.test(path) ||
  path.endsWith('src/app/api') ||
  path.endsWith('src/app/mcp/live') ||
  path.endsWith('src/stories') ||
  path.endsWith('src/test-utils.ts')

/**
 * Copies the application and optional documentation into an isolated Next project.
 * @param packageRoot - Installed package or checkout containing the application.
 * @param mdx - Documentation directory copied to Tailwind's static source path.
 */
async function stageApp(packageRoot: string, mdx?: string) {
  const parent = findWorkDir(packageRoot)
  if (!parent) throw new Error('Cannot find the `next` package to build the documentation with')

  await mkdir(parent, { recursive: true })
  const workDir = await mkdtemp(join(parent, 'app-'))
  try {
    await Promise.all(
      APP_FILES.filter((path) => existsSync(join(packageRoot, path))).map((path) =>
        cp(join(packageRoot, path), join(workDir, path), {
          recursive: true,
          filter: (source) => !isExcluded(source),
        }),
      ),
    )
    if (mdx) await cp(mdx, join(workDir, MDX_DIR), { recursive: true })
    return workDir
  } catch (error) {
    await rm(workDir, { recursive: true, force: true })
    throw error
  }
}

/**
 * Exports the website, placing each Markdown document beside its HTML page.
 * @param options - Output directory, consumer configuration, and website environment.
 */
export async function buildWebsite({
  packageRoot,
  outDir,
  env,
  configPath = resolveDocsConfig(process.cwd(), env.DOCS_CONFIG ?? process.env.DOCS_CONFIG),
}: {
  packageRoot: string
  outDir: string
  configPath?: string
  env: Record<string, string | undefined>
}) {
  await withNextExport({ packageRoot, env, configPath }, async (exportDir) => {
    // Server rewrites expose /md/<path>.md as /<path>.md; static hosting needs the same files.
    const markdownDir = join(exportDir, 'md')
    // Next exports the 404 body for an absent icon; omit that file instead.
    const iconFile = join(exportDir, 'icon.svg')
    const icon = env.ICON ?? process.env.ICON
    const isLeftOut = (source: string) => source === markdownDir || (!icon && source === iconFile)
    await mkdir(outDir, { recursive: true })
    await cp(exportDir, outDir, { recursive: true, filter: (source) => !isLeftOut(source) })
    if (existsSync(markdownDir)) await cp(markdownDir, outDir, { recursive: true })
  })
}

type ExportOptions = {
  /** Installed package or checkout containing the Next application. */
  packageRoot: string
  /** Configuration passed only to the build subprocess. */
  env: Record<string, string | undefined>
  /** Consumer module resolved in the caller's working directory. */
  configPath?: string
  /** Use the minimal document routes instead of the website layouts. */
  fragments?: boolean
  /** A file or stdin document, with its original path for relative references. */
  source?: { content: string; absoluteFilePath: string }
}

/**
 * Runs the same Next static export for both output formats, then removes the staged app.
 * @param options - Build configuration and optional single-document source.
 * @param consume - Reads the completed export before its temporary directory is removed.
 */
export async function withNextExport<T>(
  {
    packageRoot,
    env,
    configPath = resolveDocsConfig(process.cwd(), env.DOCS_CONFIG ?? process.env.DOCS_CONFIG),
    fragments = false,
    source,
  }: ExportOptions,
  consume: (exportDir: string) => Promise<T>,
) {
  const basePath = env.BASE_PATH ?? ''
  const distDir = `out${basePath}`
  const environment = {
    ...process.env,
    ...Object.fromEntries(Object.entries(env).filter(([, value]) => value !== undefined)),
    BASE_PATH: basePath,
    DIST_DIR: distDir,
    OUTPUT: 'export',
    NODE_ENV: 'production',
    // Next imports the original consumer module, preserving its server/client boundaries.
    DOCS_CONFIG: configPath ? resolve(configPath) : '',
    MDX: source ? dirname(source.absoluteFilePath) : (env.MDX ?? process.env.MDX),
    PMNDRS_FRAGMENT_INPUT: '',
    PMNDRS_FRAGMENT_PATH: '',
  } satisfies NodeJS.ProcessEnv
  // Fragments have no stylesheet to scan. Read their original MDX paths so references such
  // as Sandpack folder="../examples" can still reach files outside the documentation root.
  const workDir = await stageApp(packageRoot, fragments ? undefined : environment.MDX)

  try {
    if (!fragments && environment.MDX) environment.MDX = join(workDir, MDX_DIR)

    if (fragments) {
      await cp(join(workDir, 'src/fragments/layout.tsx'), join(workDir, 'src/app/layout.tsx'))
      await cp(join(workDir, 'src/fragments/page.tsx'), join(workDir, 'src/app/page.tsx'))
      // Keep DocsContext and other shared modules in place; only the routes change.
      for (const name of ['page.tsx', 'layout.tsx']) {
        await rm(join(workDir, 'src/app/[...slug]', name))
        if (!source) {
          // An internal prefix avoids collisions with Next's own index and 404 pages.
          const target = join(workDir, 'src/app/fragments/[...slug]', name)
          await mkdir(dirname(target), { recursive: true })
          await cp(join(workDir, 'src/fragments/[...slug]', name), target)
        }
      }
      for (const route of ['llms.txt', 'llms-full.txt', 'md', 'icon.svg']) {
        await rm(join(workDir, 'src/app', route), { recursive: true, force: true })
      }
      if (source) {
        environment.PMNDRS_FRAGMENT_INPUT = join(workDir, 'fragment.mdx')
        environment.PMNDRS_FRAGMENT_PATH = source.absoluteFilePath
        await writeFile(environment.PMNDRS_FRAGMENT_INPUT, source.content)
      }
    }

    // The subprocess isolates configuration and sends build logs to stderr, keeping stdout
    // available for a single HTML fragment. Use Next's CLI rather than its private build API.
    const next = createRequire(import.meta.url).resolve('next/dist/bin/next')
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [next, 'build', workDir], {
        cwd: workDir,
        env: environment,
        stdio: ['ignore', process.stderr, process.stderr],
      })
      child.once('error', reject)
      child.once('close', (code, signal) => {
        if (code === 0) resolve()
        else reject(new Error(`Next build failed (${signal ?? `exit ${code}`})`))
      })
    })
    return await consume(join(workDir, distDir))
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}
