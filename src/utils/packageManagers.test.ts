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
      bun: 'bun dev',
    })
  })

  it('converts every line, keeping comments and empty lines', () => {
    expect(toPackageManagers('# deps\nnpm install three\n\nnpm run dev\n')).toEqual({
      pnpm: '# deps\npnpm add three\n\npnpm dev',
      npm: '# deps\nnpm install three\n\nnpm run dev',
      yarn: '# deps\nyarn add three\n\nyarn dev',
      bun: '# deps\nbun add three\n\nbun dev',
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
