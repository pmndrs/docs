import type { SandpackFiles } from '@codesandbox/sandpack-react'
import { crawl } from '@/utils/docs'
import { readFile } from 'node:fs/promises'
import { extname, relative } from 'node:path'

type SandpackProps = {
  /** Folder containing example source files. */
  folder?: string
  /** Inline source files and display settings. */
  files?: SandpackFiles
}

/**
 * Exposes example source code in fragments, which carry no browser runtime.
 */
export async function Sandpack({ folder, files = {} }: SandpackProps) {
  const sources = { ...files }

  if (folder) {
    const paths = await crawl(
      folder,
      (file) => !file.includes('node_modules') && /\.(?:js|ts|jsx|tsx|css)$/.test(file),
    )
    await Promise.all(
      paths.map(async (file) => {
        const name = `/${relative(folder, file)}`
        const settings = sources[name]
        sources[name] = {
          ...(typeof settings === 'object' ? settings : {}),
          code: await readFile(file, 'utf8'),
        }
      }),
    )
  }

  return (
    <div className="sandpack">
      {Object.entries(sources)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, file]) => {
          if (typeof file !== 'string' && file.hidden) return null
          const code = typeof file === 'string' ? file : file.code
          const language = extname(name).slice(1) || 'text'
          return (
            <figure key={name}>
              <figcaption>{name}</figcaption>
              <pre className={`language-${language}`}>
                <code className={`language-${language}`}>{code}</code>
              </pre>
            </figure>
          )
        })}
    </div>
  )
}
