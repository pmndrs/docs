import { version } from '@/package.json'
import { MARKDOWN_REGEX, crawl, getDocs } from '@/utils/docs'
import { assertValidUrlTemplate } from '@/utils/slugify-branch'
import { Command, Option, type OptionValues } from 'commander'
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { corpus, type Page } from './browse.corpus'
import { formatHits, formatMatches } from './browse.print'
import { matchingLines, search } from './browse.search'
import { resolveTarget } from './browse.target'
import { fragmentComponents, renderFragment, renderToHtml } from './render'
import * as gitInfo from './git-info'
import { resolveVersionEnv } from './version-env'
import { buildWebsite } from './website'

/**
 * The website options — the ones that describe *a site* rather than what to compile.
 *
 * Each carries the environment variable the app reads it as, so that a flag and its variable
 * are declared in one place, and `--help` says which is which. `Option.env()` then does the
 * fallback itself, which is what keeps the reusable workflow working with no flags at all.
 */
const websiteOptions = [
  new Option('--libname <name>', 'Library name, e.g. "React Three Fiber"').env(
    'NEXT_PUBLIC_LIBNAME',
  ),
  new Option('--libname-short <name>', 'Short library name, for narrow screens').env(
    'NEXT_PUBLIC_LIBNAME_SHORT',
  ),
  new Option('--base-path <path>', 'Base path of the final URL, e.g. "/react-three-fiber"').env(
    'BASE_PATH',
  ),
  new Option(
    '--home-redirect <url>',
    'Where "/" redirects to, e.g. "/getting-started/introduction"',
  ).env('HOME_REDIRECT'),
  new Option('--url <url>', 'Public URL the website is served from').env('NEXT_PUBLIC_URL'),
  new Option('--mdx-baseurl <url>', 'Base URL relative assets are resolved against').env(
    'MDX_BASEURL',
  ),
  new Option('--sourcecode-baseurl <url>', 'Base URL of the "source code" links').env(
    'SOURCECODE_BASEURL',
  ),
  new Option('--edit-baseurl <url>', 'Base URL of the "edit this page" links').env('EDIT_BASEURL'),
  new Option('--icon <emoji>', 'Favicon emoji, e.g. "🥑"').env('ICON'),
  new Option('--logo <path>', 'Logo path or URL').env('LOGO'),
  new Option('--github <url>', 'GitHub URL').env('GITHUB'),
  new Option('--discord <url>', 'Discord URL').env('DISCORD'),
  new Option('--theme-primary <color>', 'Seed color of the palette, e.g. "#323e48"').env(
    'THEME_PRIMARY',
  ),
  new Option('--theme-scheme <scheme>', 'Palette scheme, e.g. "tonalSpot"').env('THEME_SCHEME'),
  new Option('--theme-contrast <contrast>', 'Palette contrast, e.g. "0"').env('THEME_CONTRAST'),
  new Option('--theme-note <color>', 'Color of the NOTE alerts').env('THEME_NOTE'),
  new Option('--theme-tip <color>', 'Color of the TIP alerts').env('THEME_TIP'),
  new Option('--theme-important <color>', 'Color of the IMPORTANT alerts').env('THEME_IMPORTANT'),
  new Option('--theme-warning <color>', 'Color of the WARNING alerts').env('THEME_WARNING'),
  new Option('--theme-caution <color>', 'Color of the CAUTION alerts').env('THEME_CAUTION'),
  new Option('--theme-storybook <color>', 'Color of the storybook badges').env('THEME_STORYBOOK'),
  new Option('--lib-version <version>', 'Version label, instead of `git describe --tags`').env(
    'LIB_VERSION',
  ),
  new Option('--tag-match <glob>', 'Tags the version is described from, e.g. "leva@*"').env(
    'TAG_MATCH',
  ),
  new Option(
    '--version-url-template <url>',
    'Full public URL of a branch deployment, base path included, e.g. "https://docs-git-{branch}-pmndrs.vercel.app"; enables the version switcher',
  ).env('VERSION_URL_TEMPLATE'),
  new Option(
    '--version-production-branch <branch>',
    'Branch served at --url, the others at --version-url-template (default: "main")',
  ).env('VERSION_PRODUCTION_BRANCH'),
  new Option(
    '--version-branches <regex>',
    'Branches the switcher offers (default: all but dependabot/, renovate/, changeset-release/)',
  ).env('VERSION_BRANCHES'),
  new Option(
    '--version-branches-list <branches>',
    "Explicit branches the switcher offers, comma-separated, instead of the remote's",
  ).env('VERSION_BRANCHES_LIST'),
]

/**
 * Reads the whole of stdin.
 *
 * When it is a terminal rather than a pipe, someone is typing MDX at us, and a program that
 * reads in silence is indistinguishable from one that hung — so say what is expected and how
 * to end it. On stderr, so that stdout stays a clean pipe.
 */
async function readStdin() {
  if (process.stdin.isTTY) {
    const eof = process.platform === 'win32' ? 'Ctrl-Z then Enter' : 'Ctrl-D'
    console.error(`Reading MDX — type it, then ${eof}. (Or pass a file or folder, see --help.)`)
  }

  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

/** The shortest way to name a path to a human: relative when nearby, absolute otherwise. */
function display(path: string) {
  const rel = relative(process.cwd(), path)
  return rel.length < path.length ? rel : path
}

/** Compiles every MDX file of `root` to an HTML fragment, copying everything else as is. */
async function compileFolder(root: string, outDir: string) {
  process.env.MDX = root

  const docs = await getDocs(root, null, false, fragmentComponents)
  for (const doc of docs) {
    const file = join(outDir, `${doc.slug.join('/')}.html`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, await renderToHtml(doc.content))
  }

  // Assets the docs reference — images, Sandpack folders — travel with them. Anything
  // already under `outDir` is ours, not theirs: a previous run left it there.
  const assets = await crawl(
    root,
    (path) =>
      !path.includes('node_modules') &&
      !MARKDOWN_REGEX.test(path) &&
      !resolve(path).startsWith(`${outDir}/`),
  )
  for (const asset of assets) {
    const file = join(outDir, relative(root, asset))
    await mkdir(dirname(file), { recursive: true })
    await copyFile(asset, file)
  }

  return docs.length
}

async function run(input: string | undefined, output: string | undefined, opts: OptionValues) {
  const website = opts.format === 'website'

  //
  // stdin → stdout
  //

  if (!input) {
    if (website) throw new Error('--format website needs an IN folder')

    // Relative references resolve against the working directory, the only folder the caller
    // told us about
    const html = await renderFragment(await readStdin(), {
      absoluteFilePath: join(process.cwd(), 'stdin.mdx'),
    })
    process.stdout.write(html)
    return
  }

  const from = resolve(process.cwd(), input)

  if (!(await stat(from)).isDirectory()) {
    if (website) throw new Error('--format website needs an IN folder')

    const html = await renderFragment(await readFile(from, 'utf8'), { absoluteFilePath: from })
    if (!output) {
      process.stdout.write(html)
      return
    }

    const file = resolve(process.cwd(), output)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, html)
    console.error(display(file))
    return
  }

  const outDir = resolve(process.cwd(), output ?? 'out')

  if (!website) {
    const count = await compileFolder(from, outDir)
    console.error(`${count} pages → ${display(outDir)}`)
    return
  }

  const env: Record<string, string | undefined> = { MDX: from }
  for (const option of websiteOptions) {
    env[option.envVar!] = opts[option.attributeName()]
  }

  // Git is asked here, in the library's checkout, and not by the build: that runs in a copy of
  // this package, where git would describe the wrong repository, or none at all. Every variable
  // is set, even empty, which is what tells `next.config.mjs` not to resolve them again.
  Object.assign(env, resolveVersionEnv(env, { cwd: from, git: gitInfo, assertValidUrlTemplate }))

  await buildWebsite({
    packageRoot: resolve(dirname(new URL(import.meta.url).pathname), '..'),
    outDir,
    env,
  })
  console.error(`Preview: npx -y serve ${display(outDir)}`)
}

/** Named rather than default: what compiles a folder of MDX is a build step, and it says so. */
const build = new Command('build')
  .description('Compile MDX to HTML')
  .argument('[in]', 'MDX file or folder. Reads stdin when omitted.')
  // No default: whether OUT was given is what tells a single file to write to stdout
  .argument('[out]', 'Output folder (default: "out"). Writes to stdout when IN is a file.')
  .addOption(
    new Option('--format <format>', 'What to compile to')
      .choices(['fragment', 'website'])
      .default('fragment'),
  )
  .addHelpText(
    'after',
    `
Examples:
  $ cat foo.mdx | pmndrs-docs build               an HTML fragment, on stdout
  $ pmndrs-docs build foo.mdx                     same, from a file
  $ pmndrs-docs build docs out                    a folder of MDX, compiled to HTML fragments
  $ pmndrs-docs build docs out --format website   the whole website, statically exported

A fragment is the compiled MDX and nothing else: no layout, no stylesheet, no script.
`,
  )
  .action(run)

for (const option of websiteOptions) build.addOption(option)

// Deprecated: the header no longer has a ".docs" suffix. Still accepted, so that existing
// invocations do not fail on an unknown option, but hidden from --help, and read by nothing.
build.addOption(
  new Option('--libname-dotsuffix-label <label>', 'Deprecated and ignored').hideHelp(),
)
build.addOption(new Option('--libname-dotsuffix-href <url>', 'Deprecated and ignored').hideHelp())

//
// browse & search -- the published documentation, rather than a folder of MDX
//

/** Every page of every readable library, with a word on stderr while it is fetched. */
async function readCorpus(opts: OptionValues): Promise<Page[]> {
  if (process.stderr.isTTY) process.stderr.write('reading the published documentation…\r')
  try {
    return await corpus({ refresh: opts.refresh })
  } finally {
    if (process.stderr.isTTY) process.stderr.write('\x1b[2K')
  }
}

async function runBrowse(target: string | undefined, opts: OptionValues) {
  const pages = await readCorpus(opts)
  const resolved = target ? resolveTarget(target, pages) : undefined

  // A pipe cannot answer a keystroke. It can still be handed the page it asked for.
  if (opts.print || !process.stdin.isTTY || !process.stdout.isTTY) {
    if (resolved?.kind !== 'page') {
      throw new Error(
        'browse needs a terminal. Name a page to write it to stdout, or use `search`.',
      )
    }
    process.stdout.write(`${resolved.page.body}\n`)
    return
  }

  // Loaded here and nowhere else: `build` has no business paying for a terminal UI toolkit
  const { browse } = await import('./browse')
  await browse(pages, resolved)
}

async function runSearch(words: string[], opts: OptionValues) {
  const query = words.join(' ')
  const pages = await readCorpus(opts)

  let scope = pages
  if (opts.in) {
    const target = resolveTarget(opts.in, pages)

    // Narrowed to a single page, the answer is which of its lines match
    if (target.kind === 'page') {
      const matches = matchingLines(target.page, query)
      if (matches.length) process.stdout.write(`${formatMatches(matches)}\n`)
      else process.exitCode = 1
      return
    }

    if (!target.lib) throw new Error(`--in ${opts.in}: no such library or page`)
    const { lib } = target
    scope = pages.filter((page) => page.lib.name === lib.name)
  }

  const hits = search(query, scope)
  if (!hits.length) {
    process.exitCode = 1
    return
  }
  process.stdout.write(`${formatHits(hits)}\n`)
}

const refresh = new Option('--refresh', 'Fetch the documentation again, ignoring the cache')

const browse = new Command('browse')
  .description('Read the published pmndrs documentation, in the terminal')
  .argument(
    '[target]',
    'A library, a page (`drei/performances/instances`), or anything else, which is searched for',
  )
  .addOption(refresh)
  .addOption(new Option('--print', 'Write the page to stdout instead of opening the reader'))
  .addHelpText(
    'after',
    `
Examples:
  $ pmndrs-docs browse                                the libraries, and their pages
  $ pmndrs-docs browse drei                           straight into drei
  $ pmndrs-docs browse drei/performances/instances    straight to the page
  $ pmndrs-docs browse instanced mesh                 the search, already typed

↑↓ drives whichever pane has the focus — the list of pages, or the page itself. ⏎ or tab hands
the focus over, esc or tab hands it back, and the lit border says where it is; space scrolls
the page by the screen, and the wheel moves whichever pane it points at. ←→ changes library,
b folds the sidebar away, / searches every library at once, o opens the page in a browser,
q quits. Links inside a page are clickable wherever the terminal honours OSC 8 hyperlinks.

Outside a terminal, a page target is written to stdout.
`,
  )
  .action(runBrowse)

const searchCommand = new Command('search')
  .description('Search the published pmndrs documentation, one result per line')
  .argument('<query...>', 'What to look for')
  .addOption(refresh)
  .addOption(new Option('--in <target>', 'Narrow to one library, or to one page'))
  .addHelpText(
    'after',
    `
Examples:
  $ pmndrs-docs search instanced mesh                        every library
  $ pmndrs-docs search instances --in drei                    one library
  $ pmndrs-docs search useFrame --in drei/performances/instances   the matching lines of one page

Results read \`{lib} {path} - {title}\`, the shape the MCP server publishes its index in.
Nothing found exits 1.
`,
  )
  .action(runSearch)

const program = new Command()
  .name('pmndrs-docs')
  .description('Compile pmndrs-flavored MDX — Gha, Code, Sandpack, Mermaid, Keypoints…')
  .version(version)
  // Reading the docs is what someone typing `pmndrs-docs` on its own is after; compiling
  // them is what CI is after, and CI spells out what it wants.
  .addCommand(browse, { isDefault: true })
  .addCommand(searchCommand)
  .addCommand(build)

export async function main(argv: string[]) {
  await program.parseAsync(argv, { from: 'user' })
}
