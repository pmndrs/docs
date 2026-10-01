import { describe, expect, it } from 'vitest'
import { toPackageManagers } from './packageManagers'

describe('toPackageManagers', () => {
  it('converts `npm install <pkg>`', () => {
    expect(toPackageManagers('npm install three')).toEqual({
      pnpm: 'pnpm add three',
      npm: 'npm install three',
      yarn: 'yarn add three',
      bun: 'bun add three',
    })
  })

  it('takes `npm i` for `npm install`', () => {
    expect(toPackageManagers('npm i three @react-three/fiber')).toEqual({
      pnpm: 'pnpm add three @react-three/fiber',
      npm: 'npm i three @react-three/fiber',
      yarn: 'yarn add three @react-three/fiber',
      bun: 'bun add three @react-three/fiber',
    })
  })

  it('converts `npm install` without packages', () => {
    expect(toPackageManagers('npm install')).toEqual({
      pnpm: 'pnpm install',
      npm: 'npm install',
      yarn: 'yarn',
      bun: 'bun install',
    })
  })

  it('keeps `-D`', () => {
    expect(toPackageManagers('npm install -D @types/three')).toEqual({
      pnpm: 'pnpm add -D @types/three',
      npm: 'npm install -D @types/three',
      yarn: 'yarn add -D @types/three',
      bun: 'bun add -D @types/three',
    })
  })

  it('gives yarn and bun `-D` for `--save-dev`', () => {
    expect(toPackageManagers('npm install --save-dev @types/three')).toEqual({
      pnpm: 'pnpm add --save-dev @types/three',
      npm: 'npm install --save-dev @types/three',
      yarn: 'yarn add -D @types/three',
      bun: 'bun add -D @types/three',
    })
  })

  it('converts `npx create-<app>`', () => {
    expect(toPackageManagers('npx create-react-app my-app')).toEqual({
      pnpm: 'pnpm create react-app my-app',
      npm: 'npx create-react-app my-app',
      yarn: 'yarn create react-app my-app',
      bun: 'bunx --bun create-react-app my-app',
    })
  })

  it('converts `npm create <app>`', () => {
    expect(toPackageManagers('npm create vite@latest my-app')).toEqual({
      pnpm: 'pnpm create vite@latest my-app',
      npm: 'npm create vite@latest my-app',
      yarn: 'yarn create vite@latest my-app',
      bun: 'bun create vite@latest my-app',
    })
  })

  it('drops `--` before the initializer options of `npm create`', () => {
    expect(toPackageManagers('npm create vite@latest my-app -- --template react')).toEqual({
      pnpm: 'pnpm create vite@latest my-app --template react',
      npm: 'npm create vite@latest my-app -- --template react',
      yarn: 'yarn create vite@latest my-app --template react',
      bun: 'bun create vite@latest my-app --template react',
    })
  })

  it('converts `npx <bin>`', () => {
    expect(toPackageManagers('npx @pmndrs/docs build')).toEqual({
      pnpm: 'pnpm dlx @pmndrs/docs build',
      npm: 'npx @pmndrs/docs build',
      yarn: 'yarn dlx @pmndrs/docs build',
      bun: 'bunx --bun @pmndrs/docs build',
    })
  })

  it('converts `npm run <script>`', () => {
    expect(toPackageManagers('npm run dev')).toEqual({
      pnpm: 'pnpm dev',
      npm: 'npm run dev',
      yarn: 'yarn dev',
      bun: 'bun run dev',
    })
  })

  it('keeps `run` for bun, whose own commands win over scripts', () => {
    expect(toPackageManagers('npm run build')?.bun).toBe('bun run build')
    expect(toPackageManagers('npm run test')?.bun).toBe('bun run test')
  })

  it('drops `-y` / `--yes` from `npx`', () => {
    expect(toPackageManagers('npx -y @pmndrs/docs build')).toEqual({
      pnpm: 'pnpm dlx @pmndrs/docs build',
      npm: 'npx -y @pmndrs/docs build',
      yarn: 'yarn dlx @pmndrs/docs build',
      bun: 'bunx --bun @pmndrs/docs build',
    })
    expect(toPackageManagers('npx --yes @pmndrs/docs build')).toEqual({
      pnpm: 'pnpm dlx @pmndrs/docs build',
      npm: 'npx --yes @pmndrs/docs build',
      yarn: 'yarn dlx @pmndrs/docs build',
      bun: 'bunx --bun @pmndrs/docs build',
    })
  })

  it('drops `-y` from `npx create-<app>`', () => {
    expect(toPackageManagers('npx -y create-vite my-app')).toEqual({
      pnpm: 'pnpm create vite my-app',
      npm: 'npx -y create-vite my-app',
      yarn: 'yarn create vite my-app',
      bun: 'bunx --bun create-vite my-app',
    })
  })

  it('leaves `npx` with other options alone', () => {
    expect(toPackageManagers('npx -p typescript tsc')).toBeNull()
    expect(toPackageManagers('npx --package=typescript tsc')).toBeNull()
    expect(toPackageManagers('npx -c "echo hi"')).toBeNull()
    expect(toPackageManagers('npx -y')).toBeNull()
    expect(toPackageManagers('npx -y -p typescript tsc')).toBeNull()
  })

  it('leaves chained, piped and redirected commands alone', () => {
    expect(toPackageManagers('npm install && npm run dev')).toBeNull()
    expect(toPackageManagers('npm install || true')).toBeNull()
    expect(toPackageManagers('npm install; npm run dev')).toBeNull()
    expect(toPackageManagers('npm run build | tee build.log')).toBeNull()
    expect(toPackageManagers('npm run build > build.log')).toBeNull()
    expect(toPackageManagers('npm install < packages.txt')).toBeNull()
    expect(toPackageManagers('npm install `cat packages.txt`')).toBeNull()
    expect(toPackageManagers('npm install $(cat packages.txt)')).toBeNull()
    expect(toPackageManagers('npm install three\nnpm install && npm run dev')).toBeNull()
  })

  it('converts every line, keeping comments and empty lines', () => {
    expect(toPackageManagers('# deps\nnpm install three\n\nnpm run dev\n')).toEqual({
      pnpm: '# deps\npnpm add three\n\npnpm dev',
      npm: '# deps\nnpm install three\n\nnpm run dev',
      yarn: '# deps\nyarn add three\n\nyarn dev',
      bun: '# deps\nbun add three\n\nbun run dev',
    })
  })

  it('leaves a block with any other command alone', () => {
    expect(toPackageManagers('npm install three\ncd my-app')).toBeNull()
  })

  it('leaves commands it does not know alone', () => {
    expect(toPackageManagers('npm ci')).toBeNull()
    expect(toPackageManagers('npm init')).toBeNull()
    expect(toPackageManagers('npm run')).toBeNull()
    expect(toPackageManagers('npx')).toBeNull()
    expect(toPackageManagers('pnpm add three')).toBeNull()
    expect(toPackageManagers('  npm install three')).toBeNull()
  })

  it('leaves global and flags-only installs alone', () => {
    expect(toPackageManagers('npm install -g @pmndrs/docs')).toBeNull()
    expect(toPackageManagers('npm install --global @pmndrs/docs')).toBeNull()
    expect(toPackageManagers('npm install --legacy-peer-deps')).toBeNull()
  })

  it('leaves comments alone, without a command', () => {
    expect(toPackageManagers('# nothing to run')).toBeNull()
    expect(toPackageManagers('')).toBeNull()
  })
})
