import { cn } from '@/lib/utils'
import { crawl } from '@/utils/docs'
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackFiles,
  type SandpackProviderProps,
} from '@codesandbox/sandpack-react'
import fs from 'node:fs'
import path from 'node:path'

import { pinThreeForSandpack } from './pinThree'
import { SandpackCodeViewer } from './SandpackCodeViewer'

import { ComponentProps } from 'react'

function getSandpackDependencies(folder: string) {
  const pkgPath = `${folder}/package.json`
  if (!fs.existsSync(pkgPath)) return null

  const str = fs.readFileSync(pkgPath, 'utf-8')
  return JSON.parse(str).dependencies as Record<string, string>
}

async function getSandpackFiles(
  folder: string,
  files: SandpackFiles = {},
  extensions = ['js', 'ts', 'jsx', 'tsx', 'css'],
) {
  const filepaths = await crawl(
    folder,
    (dir) =>
      !dir.includes('node_modules') && extensions.map((ext) => dir.endsWith(ext)).some(Boolean),
  )
  // console.log('filepaths', filepaths)

  return filepaths.reduce((acc, filepath) => {
    const relativeFilepath = path.relative(folder, filepath)

    const key = `/${relativeFilepath}`
    const file = files[key]
    return {
      ...acc,
      [key]: {
        ...((typeof file !== 'string' && file) || undefined),
        code: fs.readFileSync(filepath, 'utf-8'),
      },
    }
  }, {} as SandpackFiles)
}

/**
 * Coloured like a code block (`Code`), from the code colours in globals.css: the same snippet reads
 * the same in an editor and in a code block next to it. The editor sits on the code background, in
 * light and dark alike, since the syntax ramp is tuned for it.
 *
 * Its surfaces are that background and two tones of the primary palette above it, treated as the
 * code background is, for the borders and the active line and buttons. Its foregrounds (tabs,
 * buttons, the caret) are the code text and primary tones that read on it.
 *
 * The syntax keys follow the prism mapping in globals.css.
 */
const sandpackTheme = {
  colors: {
    surface1: 'var(--code-background)',
    surface2: 'oklch(from var(--md-ref-palette-primary-15) l calc(c * 0.2) h)',
    surface3: 'oklch(from var(--md-ref-palette-primary-20) l calc(c * 0.2) h)',
    disabled: 'var(--comment)',
    base: 'var(--code-text)',
    clickable: 'oklch(from var(--md-ref-palette-primary-70) l calc(c * 0.2) h)',
    hover: 'var(--code-text)',
    accent: 'var(--md-ref-palette-primary-80)',
  },
  syntax: {
    plain: 'var(--code-text)',
    comment: 'var(--comment)',
    keyword: 'var(--keyword)',
    definition: 'var(--function)',
    punctuation: 'var(--punctuation)',
    property: 'var(--property)',
    tag: 'var(--property)',
    static: 'var(--boolean)',
    string: 'var(--string)',
  },
  font: {
    mono: 'var(--font-mono)',
  },
} satisfies SandpackProviderProps['theme']

// https://sandpack.codesandbox.io/docs/getting-started/usage
export const Sandpack = async ({
  className,
  folder,
  fileExplorer,
  codeEditor,
  codeViewer,
  preview,
  ...props
}: SandpackProviderProps & {
  className?: string
  folder?: string
  codeEditor?: ComponentProps<typeof SandpackCodeEditor>
  codeViewer?: boolean | ComponentProps<typeof SandpackCodeViewer>
  preview?: ComponentProps<typeof SandpackPreview>
  fileExplorer?: boolean | ComponentProps<typeof SandpackFileExplorer>
}) => {
  // console.log('folder', folder)

  const _files = folder ? await getSandpackFiles(folder, props.files) : props.files

  const pkgDeps = folder ? getSandpackDependencies(folder) : null
  const dependencies = pinThreeForSandpack(pkgDeps ?? props.customSetup?.dependencies)
  const customSetup = {
    ...props.customSetup,
    dependencies,
  }
  // console.log('customSetup', customSetup)

  const options = {
    ...props.options,
    // editorHeight: 350
  }

  return (
    <div className={cn(className, 'sandpack')}>
      <SandpackProvider
        {...props}
        theme={sandpackTheme}
        files={_files}
        customSetup={customSetup}
        options={options}
        // The frame's corners are a code block's (`rounded-lg` in Code.tsx), so the two read as one
        // family in the prose, on the design system's scale. Sandpack also derives its inner corners
        // (tabs, buttons) from it, halving it for some.
        // Naming `--radius-lg` here is also what makes Tailwind emit it: it only declares the theme
        // variables it finds named in the sources.
        // @ts-ignore
        style={{ '--sp-border-radius': 'var(--radius-lg)' }}
      >
        <SandpackLayout>
          {fileExplorer && (
            <SandpackFileExplorer
              {...(typeof fileExplorer !== 'boolean' ? fileExplorer : undefined)}
            />
          )}
          {codeViewer ? (
            <SandpackCodeViewer {...(typeof codeViewer !== 'boolean' ? codeViewer : undefined)} />
          ) : (
            <SandpackCodeEditor showTabs={fileExplorer ? false : undefined} {...codeEditor} />
          )}

          <SandpackPreview {...preview} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
