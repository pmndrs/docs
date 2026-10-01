import { FileCodeIcon, SquareTerminalIcon } from 'lucide-react'
import { brandIcons } from '../Badge/icons'

/**
 * The icon of a file type, by file extension or fence language: a simple-icons slug of
 * `brandIcons`, or `terminal` for shell scripts.
 */
const fileIcons: Record<string, string> = {
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  typescript: 'typescript',
  tsx: 'react',
  jsx: 'react',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  javascript: 'javascript',
  css: 'css',
  json: 'json',
  html: 'html5',
  md: 'markdown',
  markdown: 'markdown',
  mdx: 'mdx',
  yml: 'yaml',
  yaml: 'yaml',
  sh: 'terminal',
  bash: 'terminal',
  zsh: 'terminal',
  shell: 'terminal',
}

/**
 * The icon to show for a file: by the extension of its name, e.g. `typescript` for
 * `lib/utils.ts`, or else by the language of its fence. `undefined` for an unknown one.
 */
export function fileIconName(filename: string | undefined, language: string | undefined) {
  const basename = filename?.split('/').pop() ?? ''
  const extension = basename.includes('.') ? basename.split('.').pop()?.toLowerCase() : undefined

  if (extension && Object.hasOwn(fileIcons, extension)) return fileIcons[extension]
  if (language && Object.hasOwn(fileIcons, language)) return fileIcons[language]
  return undefined
}

/**
 * The icon of a code block's file, monochrome: the brand logo of its type, a terminal for a
 * shell script, a generic code file otherwise.
 */
export function CodeFileIcon({
  filename,
  language,
  className,
}: {
  filename?: string
  language?: string
  className?: string
}) {
  const name = fileIconName(filename, language)

  if (name === 'terminal') return <SquareTerminalIcon className={className} aria-hidden="true" />

  const brandIcon = name ? brandIcons[name] : undefined
  if (brandIcon) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={brandIcon.path} />
      </svg>
    )
  }

  return <FileCodeIcon className={className} aria-hidden="true" />
}
