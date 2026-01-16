#!/usr/bin/env node

// $ node bin/dev.mjs ~/code/koota/docs --libname="Koota"

import minimist from 'minimist'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = dirname(__dirname)

console.log('argv=', process.argv)
const argv = minimist(process.argv.slice(2))
console.log('argv2=', argv)

const help = argv.help || argv.h
const man = `
Usage: npx @pmndrs/docs dev MDX [ --libname=LIBNAME --basePath=BASE_PATH --port=PORT --help|-h ]

Start development server for pmndrs-standardized documentation from *.mdx folder.

Example: npx @pmndrs/docs dev ./docs
         npx @pmndrs/docs dev ~/code/koota/docs --libname="Koota" --port=3000

Arguments:

  MDX: Path to the folder containing the MDX files (absolute or relative to process.cwd())

Options:

  libname: Name of the library that documentation is for, eg: "Koota"
  basePath: base path for the final URL, eg: "/koota"
  port: Port for the Next.js dev server, default: 3000
  help, h: Show this help message
`
if (help) {
  console.log(man)
  process.exit(0)
}

// Positional arguments
const mdx = argv._[0]
if (!mdx) {
  console.error('Please provide the mdx folder as the first argument.')
  console.log(man)
  process.exit(1)
}

const MDX = resolve(process.cwd(), mdx)
const _PORT = '60141' // Port for serving MDX files
const PORT = argv.port || '3000' // Port for Next.js dev server
const NEXT_PUBLIC_LIBNAME = argv.libname || 'Docs'
const BASE_PATH = argv.basePath || ''

// Set environment variables
const env = {
  ...process.env,
  MDX,
  _PORT,
  PORT,
  NEXT_PUBLIC_LIBNAME,
  BASE_PATH,
  OUTPUT: 'export',
  HOME_REDIRECT: '',
  MDX_BASEURL: `http://localhost:${_PORT}`,
  SOURCECODE_BASEURL: argv.sourcecode || '',
  EDIT_BASEURL: argv.editUrl || '',
  NEXT_PUBLIC_URL: '',
  ICON: argv.icon || '',
  LOGO: argv.logo || '',
  GITHUB: argv.github || '',
  DISCORD: argv.discord || '',
  THEME_PRIMARY: argv.themePrimary || '#323e48',
  THEME_SCHEME: argv.themeScheme || 'tonalSpot',
  THEME_CONTRAST: argv.themeContrast || '0',
  THEME_NOTE: argv.themeNote || '#1f6feb',
  THEME_TIP: argv.themeTip || '#238636',
  THEME_IMPORTANT: argv.themeImportant || '#8957e5',
  THEME_WARNING: argv.themeWarning || '#d29922',
  THEME_CAUTION: argv.themeCaution || '#da3633',
  CONTRIBUTORS_PAT: argv.contributorsPat || '',
}

console.log('\n🚀 Starting development servers...')
console.log('   MDX folder:', MDX)
console.log('   Library name:', NEXT_PUBLIC_LIBNAME)
console.log('   Dev server: http://localhost:' + PORT)
console.log('   MDX server: http://localhost:' + _PORT)
console.log('')

// Start serve for MDX files
const serve = spawn('npx', ['serve', MDX, '-p', _PORT, '--no-port-switching', '--no-clipboard'], {
  stdio: 'inherit',
  shell: true,
})

// Start Next.js dev server
const dev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: rootDir,
  env,
})

// Handle cleanup on exit
const cleanup = () => {
  console.log('\n🛑 Shutting down servers...')
  serve.kill()
  dev.kill()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

// Handle child process errors
serve.on('error', (err) => {
  console.error('Serve process error:', err)
  cleanup()
})

dev.on('error', (err) => {
  console.error('Dev process error:', err)
  cleanup()
})
