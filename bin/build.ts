#!/usr/bin/env -S npx tsx

// $ npx tsx bin/build.ts ~/code/pmndrs/react-three-fiber/docs

import minimist from 'minimist'
import { exec as execCb, spawn } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
const exec = promisify(execCb)

console.log('argv=', process.argv)
const argv = minimist(process.argv.slice(2))
console.log('argv2=', argv)

const help = argv.help || argv.h
const man = `
Usage: npx @pmndrs/docs build MDX [ OUTDIR ] [ OPTIONS ]

Generate static, pmndrs-standardized documentation website from *.mdx folder.

Example: 
  npx @pmndrs/docs build ./docs
  npx @pmndrs/docs build ~/code/pmndrs/react-three-fiber/docs \\
    --libname="React Three Fiber" \\
    --basePath="/react-three-fiber" \\
    --icon="🇨🇭" \\
    static-out

Arguments:
  MDX                         Path to the folder containing the MDX files (absolute or relative to process.cwd())
  OUTDIR                      Path to the output directory (default: "out")

Configuration Options:
  --libname                   Library name (required) [NEXT_PUBLIC_LIBNAME]
  --libnameShort              Library short name [NEXT_PUBLIC_LIBNAME_SHORT]
  --libnameDotSuffixLabel     Text for the ".docs" suffix link in header [NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL]
  --libnameDotSuffixHref      Href for the ".docs" suffix link in header [NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF]
  --basePath                  Base path for the final URL [BASE_PATH]
  --distDir                   Path to the output folder [DIST_DIR]
  --output                    Set to "export" for static output [OUTPUT]
  --homeRedirect              Where the home should redirect [HOME_REDIRECT]
  --mdxBaseurl                Base URL for inlining relative images [MDX_BASEURL]
  --sourcecodeBaseurl         Base URL for sourcecode: code path [SOURCECODE_BASEURL]
  --editBaseurl               Base URL for "Edit this page" URLs [EDIT_BASEURL]
  --url                       Final URL of the published website [NEXT_PUBLIC_URL]
  --icon                      Emoji or image to use as (fav)icon [ICON]
  --logo                      Logo src/path [LOGO]
  --github                    GitHub URL [GITHUB]
  --discord                   Discord URL [DISCORD]
  --themePrimary              Primary accent color [THEME_PRIMARY]
  --themeScheme               Theme scheme [THEME_SCHEME]
  --themeContrast             Theme contrast (-1 to 1) [THEME_CONTRAST]
  --themeNote                 "note" color [THEME_NOTE]
  --themeTip                  "tip" color [THEME_TIP]
  --themeImportant            "important" color [THEME_IMPORTANT]
  --themeWarning              "warning" color [THEME_WARNING]
  --themeCaution              "caution" color [THEME_CAUTION]
  --contributorsPat           GitHub token for contributors API [CONTRIBUTORS_PAT]
  --help, -h                  Show this help message
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
const outHostDirAbsolute = resolve(process.cwd(), outdir)
const outLocalDirAbsolute = resolve(__dirname, '..', 'out')

// Map CLI flag names to environment variable names
const FLAG_TO_ENV_MAP: Record<string, string> = {
  libname: 'NEXT_PUBLIC_LIBNAME',
  libnameShort: 'NEXT_PUBLIC_LIBNAME_SHORT',
  libnameDotSuffixLabel: 'NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL',
  libnameDotSuffixHref: 'NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF',
  basePath: 'BASE_PATH',
  distDir: 'DIST_DIR',
  output: 'OUTPUT',
  homeRedirect: 'HOME_REDIRECT',
  mdxBaseurl: 'MDX_BASEURL',
  sourcecodeBaseurl: 'SOURCECODE_BASEURL',
  editBaseurl: 'EDIT_BASEURL',
  url: 'NEXT_PUBLIC_URL',
  icon: 'ICON',
  logo: 'LOGO',
  github: 'GITHUB',
  discord: 'DISCORD',
  themePrimary: 'THEME_PRIMARY',
  themeScheme: 'THEME_SCHEME',
  themeContrast: 'THEME_CONTRAST',
  themeNote: 'THEME_NOTE',
  themeTip: 'THEME_TIP',
  themeImportant: 'THEME_IMPORTANT',
  themeWarning: 'THEME_WARNING',
  themeCaution: 'THEME_CAUTION',
  contributorsPat: 'CONTRIBUTORS_PAT',
}

// Build environment variables from args
const envArgs: Record<string, string> = {
  MDX,
}

// Process known configuration flags
Object.keys(FLAG_TO_ENV_MAP).forEach((flagName) => {
  const envName = FLAG_TO_ENV_MAP[flagName]
  if (argv[flagName] !== undefined) {
    envArgs[envName] = String(argv[flagName])
  } else if (process.env[envName]) {
    // Fallback to existing environment variable if not provided via CLI
    envArgs[envName] = process.env[envName]!
  }
})

// Set defaults for required/commonly used vars
if (!envArgs.NEXT_PUBLIC_LIBNAME) {
  envArgs.NEXT_PUBLIC_LIBNAME = process.env.LIBNAME || ''
}
if (!envArgs.BASE_PATH) {
  envArgs.BASE_PATH = ''
}
if (!envArgs.DIST_DIR) {
  envArgs.DIST_DIR = `out${envArgs.BASE_PATH}`
}

// Known flags that should not be passed as custom env vars
const PROCESSED_FLAGS = new Set(['_', 'help', 'h', ...Object.keys(FLAG_TO_ENV_MAP)])

// Add any additional custom flags as environment variables
Object.keys(argv).forEach((key) => {
  if (PROCESSED_FLAGS.has(key)) return

  // Add custom flag to Env Vars
  envArgs[key] = String(argv[key])
})

console.log('🔹 Env Injected:', envArgs)

await rm(outLocalDirAbsolute, { recursive: true, force: true })

const cmd = await spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'),
  env: {
    ...process.env,
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
