import { version } from '@/package.json'
import { WEBSITE_OPTIONS } from '@/website.options'
import { MARKDOWN_REGEX, crawl, getDocs } from '@/utils/docs'
import { Command, Option, type OptionValues } from 'commander'
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { corpus, type Page } from './browse.corpus'
import { formatHits, formatMatches } from './browse.print'
import { matchingLines, search } from './browse.search'
import { resolveTarget } from './browse.target'
import { fragmentComponents, renderFragment, renderToHtml } from './render'
import { buildWebsite, devWebsite } from './website'

/** This package, wherever it was installed: `dist/cli.mjs` is one folder down from its root. */
const packageRoot = resolve(dirname(new URL(import.meta.url).pathname), '..')

/** Every website option, as commander declares it: a flag, falling back to its variable. */
const websiteOptions = WEBSITE_OPTIONS.map(([variable, flag, description]) =>
  new Option(flag, description).env(variable),
)

/** The website options someone gave, as the environment variables the app reads them as. */
function websiteEnv(opts: OptionValues) {
  const env: Record<string, string | undefined> = {}
  for (const option of websiteOptions) env[option.envVar!] = opts[option.attributeName()]
  return env
}

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

  await buildWebsite({ packageRoot, outDir, env: { ...websiteEnv(opts), MDX: from } })
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

//
// dev -- the same website, served from the MDX folder as it is being written
//

async function runDev(input: string | undefined, opts: OptionValues) {
  const from = resolve(process.cwd(), input ?? process.env.MDX ?? 'docs')
  if (!(await stat(from)).isDirectory()) throw new Error(`${display(from)} is not a folder`)

  await devWebsite({
    packageRoot,
    port: Number(opts.port),
    env: { ...websiteEnv(opts), MDX: from },
  })
}

const dev = new Command('dev')
  .description('Serve the website from a folder of MDX, reloading as it changes')
  .argument('[in]', 'MDX folder (default: $MDX, or "docs")')
  .addOption(new Option('--port <port>', 'Port to serve on').env('PORT').default(3000))
  .addHelpText(
    'after',
    `
Examples:
  $ pmndrs-docs dev                                       the "docs" folder, on port 3000
  $ pmndrs-docs dev docs --libname "React Three Fiber"    named, as the header shows it
  $ pmndrs-docs dev ~/code/pmndrs/uikit/docs --port 4000  any folder, anywhere

Pages are read on every request — edit one, reload. The MDX folder is served alongside, so
relative assets resolve with no second server to start; --mdx-baseurl takes that over.
`,
  )
  .action(runDev)

for (const option of websiteOptions) dev.addOption(option)

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
  .addCommand(dev)
  .addCommand(build)

export async function main(argv: string[]) {
  // Before anything is parsed: every website option falls back to an environment variable, and
  // `.env` is where a documentation folder writes those down. What the environment already
  // carries wins, so a checked-in file never decides what CI builds.
  try {
    process.loadEnvFile(join(process.cwd(), '.env'))
  } catch {
    // No file, nothing to read
  }

  await program.parseAsync(argv, { from: 'user' })
}
