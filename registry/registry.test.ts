import { describe, expect, it } from 'vitest'
import registry from '../registry.json'

// `shadcn registry validate` only checks the schema: it never resolves a remote
// dependency, so two blocks pinning different design-system releases stay green.
describe('registry.json', () => {
  const designSystemDependencies = registry.items
    .flatMap((item) => item.registryDependencies ?? [])
    .filter((dependency) => dependency.startsWith('pmndrs/design-system/'))

  it('depends on the design system', () => {
    expect(designSystemDependencies.length).toBeGreaterThan(0)
  })

  it('pins every design-system dependency to a release tag', () => {
    for (const dependency of designSystemDependencies) {
      expect(dependency).toMatch(/#v\d+\.\d+\.\d+$/)
    }
  })

  it('pins every design-system dependency to the same release', () => {
    const refs = new Set(designSystemDependencies.map((dependency) => dependency.split('#')[1]))
    expect([...refs]).toHaveLength(1)
  })
})
