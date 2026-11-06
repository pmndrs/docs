import { resolveDocsConfig } from '../config.resolve'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import type { AddressInfo } from 'node:net'
import { dirname, join, resolve, sep } from 'node:path'
import serveHandler from 'serve-handler'

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

/** The application copy `dev` serves, kept between runs, under `WORK_DIR`. */
const DEV_DIR = 'dev'

/**
 * Empties a folder, but for one entry.
 * @param dir - Folder, created if absent.
 * @param kept - Name of the entry left in place.
 */
async function rmExcept(dir: string, kept: string) {
  await mkdir(dir, { recursive: true })
  const entries = (await readdir(dir)).filter((name) => name !== kept)
  await Promise.all(entries.map((name) => rm(join(dir, name), { recursive: true, force: true })))
}

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
 * @param mdx - Documentation directory placed at Tailwind's static source path.
 * @param link - For `dev`: link the documentation rather than copy it, so Tailwind rescans its
 * edits, in a lasting folder rather than a temporary one.
 */
async function stageApp(packageRoot: string, mdx?: string, { link = false } = {}) {
  const parent = findWorkDir(packageRoot)
  if (!parent) throw new Error('Cannot find the `next` package to build the documentation with')

  await mkdir(parent, { recursive: true })
  const workDir = link ? join(parent, DEV_DIR) : await mkdtemp(join(parent, 'app-'))
  // Next's cache outlives a restart: what Turbopack compiled, and what Next remembers.
  if (link) await rmExcept(workDir, '.next')
  try {
    await Promise.all(
      APP_FILES.filter((path) => existsSync(join(packageRoot, path))).map((path) =>
        cp(join(packageRoot, path), join(workDir, path), {
          recursive: true,
          filter: (source) => !isExcluded(source),
        }),
      ),
    )
    if (mdx && link) await symlink(resolve(mdx), join(workDir, MDX_DIR))
    else if (mdx) await cp(mdx, join(workDir, MDX_DIR), { recursive: true })
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

/**
 * Whether this package is an installed dependency rather than its own checkout. Turbopack refuses
 * a project under node_modules, so only an installed package has to be copied out to run.
 * @param packageRoot - Installed package or checkout containing the application.
 */
const isInstalled = (packageRoot: string) => packageRoot.split(sep).includes('node_modules')

/**
 * Serves a folder as it is on disk, on a free port, for the assets the MDX references.
 * @param folder - Documentation directory.
 */
async function serveFolder(folder: string) {
  const server = createServer((request, response) => {
    // The site and the assets are on different ports: a page fetching one is cross-origin.
    response.setHeader('Access-Control-Allow-Origin', '*')
    // Files as they are named: a clean URL would redirect `foo/index.html` and lose its query.
    return serveHandler(request, response, { public: folder, cleanUrls: false })
  })
  await new Promise<void>((resolve) => server.listen(0, resolve))
  return { server, url: `http://localhost:${(server.address() as AddressInfo).port}` }
}

/**
 * Serves the website from the documentation as it is written, with `next dev`.
 *
 * The app is staged as for a build, with the documentation linked rather than copied, so the
 * stylesheet's Tailwind `@source` scans the pages and rescans them as they change. This
 * package's own checkout serving its own `docs` runs in place instead, to keep `src`
 * hot-reloading. Unless `MDX_BASEURL` says where they are, the MDX folder's assets are served
 * alongside, on a free port.
 * @param options - MDX folder, port, consumer configuration, and website environment.
 */
export async function devWebsite({
  packageRoot,
  mdx,
  port,
  env,
  configPath = resolveDocsConfig(process.cwd(), env.DOCS_CONFIG ?? process.env.DOCS_CONFIG),
}: {
  packageRoot: string
  mdx: string
  port: number
  configPath?: string
  env: Record<string, string | undefined>
}) {
  const inPlace = !isInstalled(packageRoot) && resolve(mdx) === join(packageRoot, MDX_DIR)
  const workDir = inPlace ? packageRoot : await stageApp(packageRoot, mdx, { link: true })
  const assets = env.MDX_BASEURL ? undefined : await serveFolder(mdx)

  const environment = {
    ...process.env,
    // Where the "source code" and "edit this page" links open: the editor, on this machine
    SOURCECODE_BASEURL: `vscode://file${process.cwd()}`,
    EDIT_BASEURL: `vscode://file${resolve(mdx)}`,
    ...Object.fromEntries(Object.entries(env).filter(([, value]) => value !== undefined)),
    MDX_BASEURL: env.MDX_BASEURL ?? assets?.url,
    // A caller's production build (a bundler run in the same process) must not leak into Next's
    // dev server: its MDX would take React's production JSX runtime into a development React.
    NODE_ENV: 'development',
    DOCS_CONFIG: configPath ? resolve(configPath) : '',
    // Read where they are written: the link only exists for Tailwind.
    MDX: resolve(mdx),
  } satisfies NodeJS.ProcessEnv

  const next = createRequire(import.meta.url).resolve('next/dist/bin/next')
  const child = spawn(process.execPath, [next, 'dev', workDir, '--port', String(port)], {
    cwd: workDir,
    env: environment,
    stdio: 'inherit',
  })

  const stop = () => child.kill('SIGTERM')
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)

  await new Promise<void>((resolve, reject) => {
    child.once('error', reject)
    child.once('close', (code, signal) => {
      assets?.server.close()
      if (code === 0 || signal === 'SIGTERM' || signal === 'SIGINT') resolve()
      else reject(new Error(`Next dev server stopped (${signal ?? `exit ${code}`})`))
    })
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
