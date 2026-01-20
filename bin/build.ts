#!/usr/bin/env -S npx tsx

// $ npx tsx bin/build.ts ~/code/pmndrs/react-three-fiber/docs

import { exec as execCb, spawn } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
const exec = promisify(execCb)

console.log('argv=', process.argv)

const args = process.argv.slice(2)

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: npx @pmndrs/docs build MDX [ OUTDIR ]

Generate static, pmndrs-standardized documentation website from *.mdx folder.

Example: 
  NEXT_PUBLIC_LIBNAME="React Three Fiber" \\
  BASE_PATH="/react-three-fiber" \\
  ICON="🇨🇭" \\
  npx @pmndrs/docs build ./docs

  NEXT_PUBLIC_LIBNAME="React Three Fiber" \\
  npx @pmndrs/docs build ~/code/pmndrs/react-three-fiber/docs static-out

Arguments:
  MDX                         Path to the folder containing the MDX files (absolute or relative to process.cwd())
  OUTDIR                      Path to the output directory (default: "out")

Configuration:
  All configuration is passed via environment variables.
  See: https://github.com/pmndrs/docs/blob/main/docs/getting-started/introduction.mdx#configuration

Common environment variables:
  NEXT_PUBLIC_LIBNAME         Library name (required)
  NEXT_PUBLIC_LIBNAME_SHORT   Library short name
  BASE_PATH                   Base path for the final URL
  DIST_DIR                    Path to the output folder
  OUTPUT                      Set to "export" for static output
  HOME_REDIRECT               Where the home should redirect
  MDX_BASEURL                 Base URL for inlining relative images
  ICON                        Emoji or image to use as (fav)icon
  LOGO                        Logo src/path
  GITHUB                      GitHub URL
  DISCORD                     Discord URL
  THEME_PRIMARY               Primary accent color
  ... and many more (see documentation)
`)
  process.exit(0)
}

const __filename = fileURLToPath(import.meta.url) // Converts the URL to a file path
const __dirname = dirname(__filename) // Gets the directory name

// Positional arguments only
const mdx = args[0]
const outdir = args[1] || 'out'

if (!mdx) {
  console.error('Error: Please provide the mdx folder as the first argument.')
  console.error('Usage: npx @pmndrs/docs build MDX [ OUTDIR ]')
  console.error('Run with --help for more information.')
  process.exit(1)
}

const MDX = resolve(process.cwd(), mdx)
const outHostDirAbsolute = resolve(process.cwd(), outdir)
const outLocalDirAbsolute = resolve(__dirname, '..', 'out')

// Build environment variables - just pass through from process.env with MDX added
const envArgs: Record<string, string> = {
  ...process.env,
  MDX,
}

// Set defaults for commonly used vars if not provided
if (!envArgs.BASE_PATH) {
  envArgs.BASE_PATH = ''
}
if (!envArgs.DIST_DIR) {
  envArgs.DIST_DIR = `out${envArgs.BASE_PATH}`
}

console.log('🔹 Env Injected:', {
  MDX: envArgs.MDX,
  NEXT_PUBLIC_LIBNAME: envArgs.NEXT_PUBLIC_LIBNAME,
  BASE_PATH: envArgs.BASE_PATH,
  DIST_DIR: envArgs.DIST_DIR,
  // Show other configured vars if present
  ...(envArgs.ICON && { ICON: envArgs.ICON }),
  ...(envArgs.LOGO && { LOGO: envArgs.LOGO }),
  ...(envArgs.THEME_PRIMARY && { THEME_PRIMARY: envArgs.THEME_PRIMARY }),
})

await rm(outLocalDirAbsolute, { recursive: true, force: true })

const cmd = await spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'),
  env: {
    ...envArgs,
    NEXT_TELEMETRY_DISABLED: '1',
  },
})

cmd.on('exit', async (code) => {
  if (code !== 0) {
    console.error('Build failed with error')
    process.exit(1)
  }
  console.log('Build completed successfully.')

  await exec(
    `mkdir -p ${outHostDirAbsolute}; cp -rf ${outLocalDirAbsolute}/* ${outHostDirAbsolute}`,
  )
  console.log(`Preview: \`npx -y serve ${outHostDirAbsolute}\``)
})
