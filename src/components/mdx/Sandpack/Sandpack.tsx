import cn from '@/lib/cn'
import { crawl } from '@/utils/docs'
import { Sandpack as SP } from '@codesandbox/sandpack-react'
import fs from 'node:fs'
import path from 'node:path'
import { ComponentProps } from 'react'

function getSandpackDependencies(folder: string) {
  const pkgPath = `${folder}/package.json`
  if (!fs.existsSync(pkgPath)) return null

  const str = fs.readFileSync(pkgPath, 'utf-8')
  return JSON.parse(str).dependencies as Record<string, string>
}

type File = { code: string }

async function getSandpackFiles(folder: string, extensions = ['js', 'ts', 'jsx', 'tsx', 'css']) {
  const filepaths = await crawl(
    folder,
    (dir) =>
      !dir.includes('node_modules') && extensions.map((ext) => dir.endsWith(ext)).some(Boolean),
  )
  // console.log('filepaths', filepaths)

  const files = filepaths.reduce(
    (acc, filepath) => {
      const relativeFilepath = path.relative(folder, filepath)

      return {
        ...acc,
        [`/${relativeFilepath}`]: {
          code: fs.readFileSync(filepath, 'utf-8'),
        },
      }
    },
    {} as Record<string, File>,
  )

  return files
}

// https://sandpack.codesandbox.io/docs/getting-started/usage
export const Sandpack = async ({
  className,
  folder,
  ...props
}: { className: string; folder?: string } & ComponentProps<typeof SP>) => {
  // console.log('folder', folder)

  const files = folder ? await getSandpackFiles(folder) : props.files

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
    <div className={cn(className, 'sandpack')}>
      <SP {...props} files={files} customSetup={customSetup} options={options} />
    </div>
  )
}
