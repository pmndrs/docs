import cn from '@/lib/cn'
import { crawl } from '@/utils/docs'
import {
  Sandpack as SP,
  type SandpackFile,
  type SandpackFiles,
  type SandpackProps,
} from '@codesandbox/sandpack-react'
import fs from 'node:fs'
import path from 'node:path'

type Files = Record<string, Omit<SandpackFile, 'code'>>

function getSandpackDependencies(folder: string) {
  const pkgPath = `${folder}/package.json`
  if (!fs.existsSync(pkgPath)) return null

  const str = fs.readFileSync(pkgPath, 'utf-8')
  return JSON.parse(str).dependencies as Record<string, string>
}

async function getSandpackFiles(
  folder: string,
  files: Files = {},
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
        ...file,
        code: fs.readFileSync(filepath, 'utf-8'),
      },
    }
  }, {} as SandpackFiles)
}

// https://sandpack.codesandbox.io/docs/getting-started/usage
export const Sandpack = async ({
  className,
  folder,
  files,
  ...props
}: {
  className: string
  folder?: string
  files?: Files
} & Omit<SandpackProps, 'files'>) => {
  // console.log('folder', folder)

  const _files = folder ? await getSandpackFiles(folder, files) : files
  // console.log('_files', _files)

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
      <SP {...props} files={_files} customSetup={customSetup} options={options} />
    </div>
  )
}
