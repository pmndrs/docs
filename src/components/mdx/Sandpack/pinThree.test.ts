import { describe, expect, it } from 'vitest'
import { LAST_SANDPACK_SAFE_THREE, pinThreeForSandpack, resolvesToBrokenThree } from './pinThree'

describe('resolvesToBrokenThree', () => {
  it.each(
    [
      ['latest', '*', 'x', ''],
      ['>=0.150.0', '>0.150'],
      ['0.186.0', '0.186.1', '=0.186.1', '^0.186.0', '~0.187.0', '0.186.x', '0.190'],
      ['1.0.0', '^1.0.0'],
    ].flat(),
  )('is true for %j', (spec) => {
    expect(resolvesToBrokenThree(spec)).toBe(true)
  })

  it.each(['0.185.1', '^0.185.0', '~0.185.0', '0.160.0', '^0.150.0', '<0.186.0', 'next'])(
    'is false for %j',
    (spec) => {
      expect(resolvesToBrokenThree(spec)).toBe(false)
    },
  )
})

describe('pinThreeForSandpack', () => {
  it('pins three when it would resolve to a broken release', () => {
    const dependencies = { react: 'latest', three: 'latest', '@react-three/fiber': 'latest' }

    expect(pinThreeForSandpack(dependencies)).toEqual({
      react: 'latest',
      three: LAST_SANDPACK_SAFE_THREE,
      '@react-three/fiber': 'latest',
    })
  })

  it('keeps a safe three as is', () => {
    const dependencies = { three: '0.160.0' }

    expect(pinThreeForSandpack(dependencies)).toBe(dependencies)
  })

  it('leaves dependencies without three untouched', () => {
    const dependencies = { react: 'latest' }

    expect(pinThreeForSandpack(dependencies)).toBe(dependencies)
    expect(pinThreeForSandpack(undefined)).toBeUndefined()
  })
})
