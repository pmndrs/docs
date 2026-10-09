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
 * Its surfaces and foregrounds (tabs, buttons, the caret) are the code colours too, and primary.
 * Its error and warning colours are the dark scheme's tones of the error and warning palettes: left
 * out, Sandpack would pick its light defaults, as it can't tell a `var()` surface is dark (a pale
 * error line behind the light code text).
 *
 * The syntax keys follow the prism mapping in globals.css.
 */
const sandpackTheme = {
  colors: {
    surface1: 'var(--code-background)',
    surface2: 'var(--code-surface-2)',
    surface3: 'var(--code-surface-3)',
    disabled: 'var(--comment)',
    base: 'var(--code-text)',
    clickable: 'var(--code-clickable)',
    hover: 'var(--code-text)',
    accent: 'var(--md-ref-palette-primary-80)',
    error: 'var(--md-ref-palette-error-80)',
    errorSurface: 'var(--md-ref-palette-error-30)',
    warning: 'var(--md-ref-palette-warning-80)',
    warningSurface: 'var(--md-ref-palette-warning-30)',
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
