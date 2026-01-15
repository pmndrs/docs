import cn from '@/lib/cn'
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

import { SandpackCodeViewer } from './SandpackCodeViewer'

// Import the config directly for theme access
import { ComponentProps } from 'react'
import tailwindConfig from '../../../../tailwind.config'

// In Tailwind v4, we access theme values directly from the config
// or use CSS variables where possible

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
  const dependencies = pkgDeps ?? props.customSetup?.dependencies
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
        theme={{
          colors: {
            // Using CSS variable via getComputedStyle or hardcoded fallback
            // @ts-ignore
            surface1: 'var(--mcu-inverse-surface)',
          },
          font: {
            // Inconsolata is defined in globals.css @theme
            mono: '"Inconsolata", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          },
        }}
        files={_files}
        customSetup={customSetup}
        options={options}
        // Using CSS variable for border radius
        // @ts-ignore
        style={{ '--sp-border-radius': '0.5rem' }}
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
