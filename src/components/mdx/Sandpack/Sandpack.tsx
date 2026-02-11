import { crawl } from '@/utils/docs'
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
  type SandpackFiles,
  type SandpackProviderProps,
} from '@codesandbox/sandpack-react'
import fs from 'node:fs'
import path from 'node:path'
import { ComponentProps } from 'react'

import { SandpackClient } from './SandpackClient'
import { SandpackCodeViewer } from './SandpackCodeViewer'

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
  const _files = folder ? await getSandpackFiles(folder, props.files) : props.files

  const pkgDeps = folder ? getSandpackDependencies(folder) : null
  const dependencies = pkgDeps ?? props.customSetup?.dependencies
  const customSetup = {
    ...props.customSetup,
    dependencies,
  }

  const options = {
    ...props.options,
    // editorHeight: 350
  }

  return (
    <SandpackClient
      className={className}
      files={_files}
      customSetup={customSetup}
      options={options}
      fileExplorer={fileExplorer}
      codeEditor={codeEditor}
      codeViewer={codeViewer}
      preview={preview}
      {...props}
    />
  )
}
