/**
 * The package managers a terminal command is offered in, in the order of their tabs.
 */
export const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const

export type PackageManager = (typeof packageManagers)[number]

export type PackageManagerCommands = Record<PackageManager, string>

export function isPackageManager(value: unknown): value is PackageManager {
  return packageManagers.includes(value as PackageManager)
}

type OtherCommands = Omit<PackageManagerCommands, 'npm'>

/**
 * Chained, piped or redirected commands, and substitutions: the line is more than one npm command.
 */
const shellOperators = ['&&', '||', ';', '|', '>', '<', '`', '$(']

function hasShellOperator(line: string) {
  return shellOperators.some((operator) => line.includes(operator))
}

/**
 * The arguments of `npx`, without a leading `-y` / `--yes` (the other package managers do not
 * prompt) — `null` when another npx option is left, which we do not know how to translate.
 */
function npxArgsWithoutYes(args: string): string | null {
  const rest = args.replace(/^(?:-y|--yes)\s+/, '')
  if (rest.startsWith('-')) return null
  return rest
}

/**
 * One npm command line, in the other package managers — `null` when it is not one we know.
 */
function convertLine(line: string): OtherCommands | null {
  if (hasShellOperator(line)) return null

  // `npm install` / `npm i`, with or without packages
  const install = line.match(/^npm (?:install|i)(?: (.*))?$/)
  if (install) {
    const args = install[1]?.trim() ?? ''

    if (args === '') {
      return { pnpm: 'pnpm install', yarn: 'yarn', bun: 'bun install' }
    }

    const tokens = args.split(/\s+/)
    // Flags alone (`npm install --legacy-peer-deps`) and global installs differ too much
    const hasPackage = tokens.some((token) => !token.startsWith('-'))
    const isGlobal = tokens.some((token) => token === '-g' || token === '--global')
    if (!hasPackage || isGlobal) return null

    // yarn and bun know `-D`, not `--save-dev`
    const devArgs = tokens.map((token) => (token === '--save-dev' ? '-D' : token)).join(' ')
    return { pnpm: `pnpm add ${args}`, yarn: `yarn add ${devArgs}`, bun: `bun add ${devArgs}` }
  }

  // `npx foo` and `npx create-foo`
  const npx = line.match(/^npx (\S.*)$/)
  if (npx) {
    const args = npxArgsWithoutYes(npx[1])
    if (args === null) return null

    const create = args.match(/^create-(\S.*)$/)
    if (create) {
      const rest = create[1]
      return {
        pnpm: `pnpm create ${rest}`,
        yarn: `yarn create ${rest}`,
        bun: `bunx --bun create-${rest}`,
      }
    }

    return { pnpm: `pnpm dlx ${args}`, yarn: `yarn dlx ${args}`, bun: `bunx --bun ${args}` }
  }

  // `npm create foo`
  const npmCreate = line.match(/^npm create (\S.*)$/)
  if (npmCreate) {
    // npm needs `--` before the options it passes on to the initializer, the others do not
    const tokens = npmCreate[1].split(/\s+/)
    const separator = tokens.indexOf('--')
    if (separator !== -1) tokens.splice(separator, 1)
    const rest = tokens.join(' ')
    return { pnpm: `pnpm create ${rest}`, yarn: `yarn create ${rest}`, bun: `bun create ${rest}` }
  }

  // `npm run foo` — bun needs `run`: its own commands (`bun build`, `bun test`…) win over scripts
  const run = line.match(/^npm run (\S.*)$/)
  if (run) {
    const rest = run[1]
    return { pnpm: `pnpm ${rest}`, yarn: `yarn ${rest}`, bun: `bun run ${rest}` }
  }

  return null
}

function isCommentOrEmpty(line: string) {
  const trimmed = line.trim()
  return trimmed === '' || trimmed.startsWith('#')
}

/**
 * An npm command (one or more lines) in every package manager, e.g. `npm install three` gives
 * `pnpm add three`, `yarn add three` and `bun add three`.
 *
 * Empty and `#` comment lines are kept as they are. `null` when the command has a line that is
 * not an npm command we know (chained or piped commands included), or no command at all: the block
 * is then left alone.
 */
export function toPackageManagers(command: string): PackageManagerCommands | null {
  const lines = command.trimEnd().split('\n')

  const converted: Record<PackageManager, string[]> = { pnpm: [], npm: [], yarn: [], bun: [] }
  let hasCommand = false

  for (const line of lines) {
    if (isCommentOrEmpty(line)) {
      for (const packageManager of packageManagers) converted[packageManager].push(line)
      continue
    }

    const other = convertLine(line.trimEnd())
    if (!other) return null

    hasCommand = true
    converted.npm.push(line.trimEnd())
    converted.pnpm.push(other.pnpm)
    converted.yarn.push(other.yarn)
    converted.bun.push(other.bun)
  }

  if (!hasCommand) return null

  return {
    pnpm: converted.pnpm.join('\n'),
    npm: converted.npm.join('\n'),
    yarn: converted.yarn.join('\n'),
    bun: converted.bun.join('\n'),
  }
}
