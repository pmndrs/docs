#!/usr/bin/env node

// $ node bin/build.mjs ~/code/pmndrs/react-three-fiber/docs

import { spawn, exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'
import minimist from 'minimist'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const exec = promisify(execCb)

console.log('argv=', process.argv)
var argv = minimist(process.argv.slice(2))
console.log('argv2=', argv)

const help = argv.help || argv.h
const man = `
Usage: npm exec -y --package=@pmndrs/docs build -- MDX [ OUTDIR ] [ --libname=LIBNAME --basePath=BASE_PATH --help|-h ]

Generate static, pmndrs-standardized documentation website from *.mdx folder.

Example: npx @pmndrs/docs build ./docs
         npx @pmndrs/docs build ~code/pmndrs/react-three-fiber/docs --libname="React Three Fiber" --basePath="/react-three-fiber" static-out

Arguments:

  MDX: Path to the folder containing the MDX files (absolute or relative to process.cwd())
  OUT_DIR: Path to the output directory (absolute or relative to process.cwd()), default: "out"

Options:

  libname: Name of the library that documentation is for, eg: "React Three Fiber"
  basePath: base path for the final URL, eg: "/react-three-fiber"
  help, h: Show this help message
`
if (help) {
  console.log(man)
  process.exit(0)
}

const __filename = fileURLToPath(import.meta.url) // Converts the URL to a file path
const __dirname = dirname(__filename) // Gets the directory name

// Positional arguments
const mdx = argv._[0]
const outdir = argv._[1] || 'out'
if (!mdx) {
  console.error('Please provide the mdx folder as the first argument.')
  console.log(man)
  process.exit(1)
}

const MDX = resolve(process.cwd(), mdx)
const NEXT_PUBLIC_LIBNAME = argv.libname || process.env.LIBNAME
const BASE_PATH = argv.basePath || process.env.BASE_PATH || ''
const DIST_DIR = `out${BASE_PATH}`

const outHostDirAbsolute = resolve(process.cwd(), outdir)
const outLocalDirAbsolute = resolve(__dirname, '..', 'out')

const env = {
  MDX,
  NEXT_PUBLIC_LIBNAME,
  BASE_PATH,
  DIST_DIR,
}
console.log('env=', env)

await exec(`rm -rf ${outLocalDirAbsolute}`)

const cmd = await spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'),
  env: {
    ...process.env,
    ...env,
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
