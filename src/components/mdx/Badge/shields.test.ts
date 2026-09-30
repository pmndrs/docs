import { describe, expect, it } from 'vitest'
import { parseShield } from './shields'

const message = (src: string) => parseShield(src)?.message

describe('parseShield: static badges', () => {
  it('reads a label-less badge as its message, and drops its color', () => {
    expect(parseShield('https://img.shields.io/badge/-suspense-brightgreen')).toEqual({
      label: undefined,
      message: 'suspense',
      logo: undefined,
    })
  })

  it('reads nothing into the message: "storybook" is text, not a color or a logo', () => {
    expect(parseShield('https://img.shields.io/badge/-storybook-%23ff69b4')).toEqual({
      label: undefined,
      message: 'storybook',
      logo: undefined,
    })
  })

  it('decodes spaces, dashes and underscores the shields.io way', () => {
    expect(message('https://img.shields.io/badge/-Dom%20only-red')).toBe('Dom only')
    expect(message('https://img.shields.io/badge/-Dom_only-red')).toBe('Dom only')
    expect(message('https://img.shields.io/badge/-web--gpu-blue')).toBe('web-gpu')
    expect(message('https://img.shields.io/badge/-snake__case-blue')).toBe('snake_case')
  })

  it('reads a no-break space as a space, raw or encoded', () => {
    // 10 drei pages write `-Dom only-` with a U+00A0 between the words
    expect(message('https://img.shields.io/badge/-Dom only-red')).toBe('Dom only')
    expect(message('https://img.shields.io/badge/-Dom%C2%A0only-red')).toBe('Dom only')
  })

  it('ignores the other query options', () => {
    expect(message('https://img.shields.io/badge/-storybook-ff69b4?style=flat')).toBe('storybook')
  })

  it('reads a two-part badge as message and color, with no label, `.svg` suffix or not', () => {
    expect(
      parseShield(
        'https://img.shields.io/badge/chromatic-171c23.svg?style=flat&colorA=000000&colorB=000000&logo=chromatic&logoColor=ffffff',
      ),
    ).toEqual({ label: undefined, message: 'chromatic', logo: 'chromatic' })
  })

  it('reads a three-part badge as label, message and color', () => {
    expect(parseShield('https://img.shields.io/badge/github-repo-blue?logo=github')).toEqual({
      label: 'github',
      message: 'repo',
      logo: 'github',
    })
  })

  it('reads a static/v1 badge, with an empty label', () => {
    expect(
      parseShield(
        'https://img.shields.io/static/v1?message=Storybook&style=flat&colorA=000000&colorB=000000&label=&logo=storybook&logoColor=ffffff',
      ),
    ).toEqual({ label: undefined, message: 'Storybook', logo: 'storybook' })
  })

  it('reads a static/v1 badge whose query starts with `?&`, with a label', () => {
    expect(
      parseShield(
        'https://img.shields.io/static/v1?&message=Open%20in%20%20Codespaces&style=flat&colorA=000000&colorB=000000&label=GitHub&logo=github&logoColor=ffffff',
      ),
    ).toEqual({ label: 'GitHub', message: 'Open in Codespaces', logo: 'github' })
  })
})

describe('parseShield: live badges, their name only', () => {
  it('reads an npm version badge as "npm"', () => {
    expect(
      parseShield(
        'https://img.shields.io/npm/v/@react-three/drei?style=flat&colorA=000000&colorB=000000',
      ),
    ).toEqual({ message: 'npm', logo: undefined })
    expect(message('https://img.shields.io/npm/v/three')).toBe('npm')
  })

  it('reads an npm downloads badge as "downloads", `.svg` suffix or not', () => {
    expect(
      parseShield(
        'https://img.shields.io/npm/dt/@react-three/drei.svg?style=flat&colorA=000000&colorB=000000',
      ),
    ).toEqual({ message: 'downloads', logo: undefined })
    expect(message('https://img.shields.io/npm/d18m/@react-three/drei')).toBe('downloads')
  })

  it('reads a discord badge as its label, "discord" when it has none', () => {
    expect(
      parseShield(
        'https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff',
      ),
    ).toEqual({ message: 'discord', logo: 'discord' })
    expect(message('https://img.shields.io/discord/740090768164651008?label=chat')).toBe('chat')
    expect(
      parseShield('https://img.shields.io/discord/740090768164651008?label=&logo=discord'),
    ).toEqual({ message: 'discord', logo: 'discord' })
    expect(parseShield('https://img.shields.io/discord/740090768164651008')).toEqual({
      message: 'discord',
      logo: undefined,
    })
  })

  it('reads any other endpoint as its usual label, or its first path segment', () => {
    expect(message('https://img.shields.io/npm/l/@react-three/drei')).toBe('license')
    expect(message('https://img.shields.io/github/stars/pmndrs/drei')).toBe('stars')
    expect(message('https://img.shields.io/github/v/release/pmndrs/drei')).toBe('release')
    expect(message('https://img.shields.io/bundlephobia/minzip/zustand')).toBe('minzipped size')
    expect(message('https://img.shields.io/codecov/c/github/pmndrs/zustand')).toBe('codecov')
    expect(message('https://img.shields.io/github/stars/pmndrs/drei?label=Stars')).toBe('Stars')
  })

  it('keeps the logo of a live badge, and drops its color', () => {
    expect(
      parseShield('https://img.shields.io/github/stars/pmndrs/drei?logo=github&color=yellow'),
    ).toEqual({ message: 'stars', logo: 'github' })
  })
})

describe('parseShield: anything else', () => {
  it('leaves malformed static badges alone', () => {
    expect(parseShield('https://img.shields.io/badge/-storybook')).toBeUndefined()
    expect(parseShield('https://img.shields.io/badge/a-b-c-d')).toBeUndefined()
    expect(parseShield('https://img.shields.io/badge/a/b')).toBeUndefined()
    expect(parseShield('https://img.shields.io/static/v1?label=a')).toBeUndefined()
    expect(parseShield('https://img.shields.io/')).toBeUndefined()
  })

  it('leaves any other image alone', () => {
    expect(parseShield('/basic-example.gif')).toBeUndefined()
    expect(parseShield('https://example.com/badge/-a-red')).toBeUndefined()
    expect(parseShield(undefined)).toBeUndefined()
  })
})
