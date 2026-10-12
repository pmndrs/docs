import { build } from 'esbuild'
import { createRequire, isBuiltin } from 'node:module'
import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { parseLocalMdx, resolveLocalMdx } from '@/utils/localMdx'
import { crawl, MARKDOWN_REGEX } from '@/utils/docs'
import matter from 'gray-matter'

/** Stage the caller's source tree so relative TS imports survive and Next sees client boundaries. */
export async function stageLocalMdx(sourceDocs: string, workDir: string) {
  sourceDocs = await realpath(resolve(sourceDocs))
  const files = await crawl(sourceDocs, (path) => MARKDOWN_REGEX.test(path))
  const pages = []
  for (const file of files) {
    const source = matter(await readFile(file, 'utf8')).content
    const parsed = parseLocalMdx(source)
    if (parsed.imports.length) {
      // Fail on the original source paths before copying, with actionable author diagnostics.
      await resolveLocalMdx(source, file)
      pages.push({ file, parsed })
    }
  }
  if (!pages.length) return join(workDir, 'docs')
  let sourceRoot = sourceDocs
  while (!existsSync(join(sourceRoot, 'package.json')) && dirname(sourceRoot) !== sourceRoot)
    sourceRoot = dirname(sourceRoot)
  if (dirname(sourceRoot) === sourceRoot) sourceRoot = dirname(sourceDocs)
  const stagedRoot = join(workDir, 'local-source')
  const sourceFiles = new Set<string>()
  const dependencies = new Map<string, string>()
  for (const { file, parsed } of pages) {
    const result = await build({
      stdin: {
        contents: `${parsed.statements}\nexport { ${parsed.names.join(', ')} }`,
        resolveDir: dirname(file),
        loader: 'tsx',
      },
      bundle: true,
      write: false,
      metafile: true,
      platform: 'node',
      packages: 'external',
      plugins: [
        {
          name: 'public-docs-api',
          setup(builder) {
            builder.onResolve({ filter: /^@pmndrs\/docs\// }, (args) => ({
              path: args.path,
              external: true,
            }))
          },
        },
      ],
    })
    for (const input of Object.keys(result.metafile!.inputs)) {
      if (input !== '<stdin>') {
        sourceFiles.add(resolve(input))
        for (const imported of result.metafile!.inputs[input].imports) {
          if (imported.external && !imported.path.startsWith('.') && !isBuiltin(imported.path))
            dependencies.set(imported.path, resolve(input))
        }
      }
    }
  }
  for (const file of sourceFiles) {
    const target = join(stagedRoot, relative(sourceRoot, file))
    if (!target.startsWith(`${stagedRoot}/`))
      throw new Error(`${file}: local imports must remain within the consuming repository`)
    await mkdir(dirname(target), { recursive: true })
    await cp(file, target)
  }
  await cp(sourceDocs, join(stagedRoot, relative(sourceRoot, sourceDocs)), { recursive: true })
  const copiedPackages = new Set<string>()
  async function copyDependency(specifier: string, fromFile: string) {
    if (
      specifier.startsWith('@pmndrs/docs/') ||
      specifier === 'react' ||
      specifier.startsWith('react/') ||
      isBuiltin(specifier)
    )
      return
    const name = specifier.startsWith('@')
      ? specifier.split('/').slice(0, 2).join('/')
      : specifier.split('/')[0]
    if (copiedPackages.has(name)) return
    let entry: string
    try {
      entry = createRequire(fromFile).resolve(specifier)
    } catch {
      // Source-mode consumers may deliberately use the engine's own shared primitives.
      createRequire(import.meta.url).resolve(specifier)
      return
    }
    let packageRoot = dirname(entry)
    while (!existsSync(join(packageRoot, 'package.json')) && dirname(packageRoot) !== packageRoot)
      packageRoot = dirname(packageRoot)
    const metadata = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'))
    copiedPackages.add(name)
    await cp(packageRoot, join(stagedRoot, 'node_modules', name), {
      recursive: true,
      dereference: true,
      filter: (path) => !relative(packageRoot, path).split(/[\\/]/).includes('node_modules'),
    })
    for (const dependency of Object.keys(metadata.dependencies ?? {}))
      await copyDependency(dependency, join(packageRoot, 'package.json'))
  }
  for (const [specifier, fromFile] of dependencies) await copyDependency(specifier, fromFile)
  // A consuming repo may invoke the source checkout CLI before @pmndrs/docs is installed.
  // Rewrite package imports only in this temporary source copy, to the same public helper.
  const modules = await crawl(stagedRoot, (path) => /\.[cm]?[jt]sx?$/.test(path))
  for (const file of modules) {
    const contents = await readFile(file, 'utf8')
    if (contents.includes('@pmndrs/docs/')) {
      const require = createRequire(import.meta.url)
      const engineRoot = dirname(require.resolve('@pmndrs/docs/package.json'))
      await writeFile(
        file,
        contents.replace(/(['"])(@pmndrs\/docs\/[^'"]+)\1/g, (_, quote, name) => {
          const helper = relative(
            dirname(file),
            join(
              workDir,
              name === '@pmndrs/docs/mdx'
                ? 'src/mdx.ts'
                : relative(engineRoot, require.resolve(name)),
            ),
          ).replace(/\\/g, '/')
          return JSON.stringify(helper.startsWith('.') ? helper : `./${helper}`)
        }),
      )
    }
  }
  const manifest: string[] = []
  const entries: string[] = []
  pages.forEach(({ file, parsed }, index) => {
    const stagedFile = join(stagedRoot, relative(sourceRoot, file))
    const statements = parsed.statements.replace(
      /(from\s*['"])(\.[^'"]+)(['"])/g,
      (_, before, specifier, after) => {
        const path = relative(
          join(workDir, 'src/utils'),
          resolve(dirname(stagedFile), specifier),
        ).replace(/\\/g, '/')
        return `${before}${path.startsWith('.') ? path : `./${path}`}${after}`
      },
    )
    // Namespace per page avoids collisions between aliases from different authored pages.
    manifest.push(statements)
    // Each scope module keeps the author's import aliases local to that module.
    entries.push(`${JSON.stringify(stagedFile)}: scope${index}`)
  })
  for (let index = 0; index < pages.length; index++) {
    await writeFile(
      join(workDir, `src/utils/localMdxScope${index}.ts`),
      `${manifest[index]}\nexport const scope = { ${pages[index].parsed.names.join(', ')} }\n`,
    )
  }
  await writeFile(
    join(workDir, 'src/utils/localMdxScopes.ts'),
    `${pages.map((_, index) => `import { scope as scope${index} } from './localMdxScope${index}'`).join('\n')}\nexport const localMdxScopes: Record<string, Record<string, unknown>> = { ${entries.join(',\n')} }\n`,
  )
  // The website only uses statically imported scopes. Leave runtime bundling to the
  // CLI/public Markdown entry rather than asking Next to analyze dynamic module imports.
  await writeFile(
    join(workDir, 'src/utils/localMdxRuntime.ts'),
    `export async function importLocalMdxScope(path: string, _parsed: unknown): Promise<Record<string, unknown>> { throw new Error('Missing prepared local MDX scope: ' + path) }\n`,
  )
  // Tailwind's @source still sees authored files under docs, while the compiler uses the
  // preserved source tree to resolve imports outside that folder.
  return join(stagedRoot, relative(sourceRoot, sourceDocs))
}
