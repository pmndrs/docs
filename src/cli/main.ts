import { version } from '@/package.json'
import { MARKDOWN_REGEX, crawl, getDocs } from '@/utils/docs'
import { Command, Option, type OptionValues } from 'commander'
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fragmentComponents, renderFragment, renderToHtml } from './render'
import { buildWebsite } from './website'

/**
 * The website options — the ones that describe *a site* rather than what to compile.
 *
 * Each carries the environment variable the app reads it as, so that a flag and its variable
 * are declared in one place, and `--help` says which is which. `Option.env()` then does the
 * fallback itself, which is what keeps the Docker image and the reusable workflow working
 * with no flags at all.
 */
const websiteOptions = [
  new Option('--libname <name>', 'Library name, e.g. "React Three Fiber"').env(
    'NEXT_PUBLIC_LIBNAME',
  ),
  new Option('--libname-short <name>', 'Short library name, for narrow screens').env(
    'NEXT_PUBLIC_LIBNAME_SHORT',
  ),
  new Option('--libname-dotsuffix-label <label>', 'Suffix label, e.g. "docs"').env(
    'NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL',
  ),
  new Option('--libname-dotsuffix-href <url>', 'Suffix link').env(
    'NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF',
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

  await buildWebsite({
    packageRoot: resolve(dirname(new URL(import.meta.url).pathname), '..'),
    outDir,
    // Next builds where it is told to, and this must sit outside `node_modules`
    workDir: resolve(process.cwd(), '.pmndrs-docs'),
    env,
  })
  console.error(`Preview: npx -y serve ${display(outDir)}`)
}

const program = new Command()
  .name('pmndrs-docs')
  .description('Compile pmndrs-flavored MDX — Gha, Code, Sandpack, Mermaid, Keypoints…')
  .version(version)
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
  $ cat foo.mdx | pmndrs-docs               an HTML fragment, on stdout
  $ pmndrs-docs foo.mdx                     same, from a file
  $ pmndrs-docs docs out                    a folder of MDX, compiled to HTML fragments
  $ pmndrs-docs docs out --format website   the whole website, statically exported

A fragment is the compiled MDX and nothing else: no layout, no stylesheet, no script.
`,
  )
  .action(run)

for (const option of websiteOptions) program.addOption(option)

export async function main(argv: string[]) {
  await program.parseAsync(argv, { from: 'user' })
}
