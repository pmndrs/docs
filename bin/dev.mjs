#!/usr/bin/env node

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = dirname(__dirname)

// Set environment variables
process.env._PORT = '60141'
process.env.MDX = 'docs'
process.env.NEXT_PUBLIC_LIBNAME = 'Poimandres'
process.env.NEXT_PUBLIC_LIBNAME_SHORT = 'pmndrs'
process.env.NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL = 'docs'
process.env.NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF = 'https://docs.pmnd.rs'
process.env.BASE_PATH = ''
process.env.DIST_DIR = ''
process.env.OUTPUT = 'export'
process.env.HOME_REDIRECT = ''
process.env.MDX_BASEURL = `http://localhost:${process.env._PORT}`
process.env.SOURCECODE_BASEURL = `vscode://file${rootDir}`
process.env.EDIT_BASEURL = `vscode://file${rootDir}/docs`
process.env.NEXT_PUBLIC_URL = ''
process.env.ICON = ''
process.env.LOGO = 'gutenberg.jpg'
process.env.GITHUB = 'https://github.com/pmndrs/docs'
process.env.DISCORD = 'https://discord.com/channels/740090768164651008/1264328004172255393'
process.env.THEME_PRIMARY = '#323e48'
process.env.THEME_SCHEME = 'tonalSpot'
process.env.THEME_CONTRAST = '0'
process.env.THEME_NOTE = '#1f6feb'
process.env.THEME_TIP = '#238636'
process.env.THEME_IMPORTANT = '#8957e5'
process.env.THEME_WARNING = '#d29922'
process.env.THEME_CAUTION = '#da3633'
process.env.CONTRIBUTORS_PAT = ''

console.log('🚀 Starting development servers...\n')

// Start serve for MDX files
const serve = spawn(
  'npx',
  ['serve', 'docs', '-p', '60141', '--no-port-switching', '--no-clipboard'],
  {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  },
)

// Start Next.js dev server
const dev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: rootDir,
  env: process.env,
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
