import { describe, it, expect } from 'vitest'
import { formatStars, parseGitHubRepo } from './github'

describe('parseGitHubRepo', () => {
  it('reads the owner and repo of a repository URL', () => {
    expect(parseGitHubRepo('https://github.com/pmndrs/react-three-fiber')).toEqual({
      owner: 'pmndrs',
      repo: 'react-three-fiber',
    })
  })

  it('ignores a trailing path, slash or .git', () => {
    expect(parseGitHubRepo('https://github.com/pmndrs/drei/tree/master')).toEqual({
      owner: 'pmndrs',
      repo: 'drei',
    })
    expect(parseGitHubRepo('https://github.com/pmndrs/drei/')?.repo).toBe('drei')
    expect(parseGitHubRepo('https://github.com/pmndrs/drei.git')?.repo).toBe('drei')
  })

  it('rejects anything that is not a GitHub repository', () => {
    expect(parseGitHubRepo('https://github.com/pmndrs')).toBeUndefined()
    expect(parseGitHubRepo('https://discord.gg/poimandres')).toBeUndefined()
  })
})

describe('formatStars', () => {
  it('shortens thousands and millions, in lowercase', () => {
    expect(formatStars(950)).toBe('950')
    expect(formatStars(2140)).toBe('2.1k')
    expect(formatStars(30012)).toBe('30k')
    expect(formatStars(125300)).toBe('125k')
    expect(formatStars(1_200_000)).toBe('1.2m')
  })
})
