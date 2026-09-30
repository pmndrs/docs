import { describe, expect, it } from 'vitest'
import { parseShield } from './shields'

describe('parseShield: label-less static badges (tags)', () => {
  const message = (src: string) => parseShield(src)?.message
  const color = (src: string) => parseShield(src)?.color

  it('reads the message of a label-less static badge', () => {
    expect(parseShield('https://img.shields.io/badge/-suspense-brightgreen')).toEqual({
      label: undefined,
      message: 'suspense',
      color: 'tip',
      logo: undefined,
    })
    expect(message('https://img.shields.io/badge/-suspense-brightgreen')).toBe('suspense')
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

  it('ignores the query string', () => {
    expect(message('https://img.shields.io/badge/-storybook-ff69b4?style=flat')).toBe('storybook')
  })

  it('maps the meaningful shields.io colors to a color role', () => {
    expect(color('https://img.shields.io/badge/-a-brightgreen')).toBe('tip')
    expect(color('https://img.shields.io/badge/-a-green')).toBe('tip')
    expect(color('https://img.shields.io/badge/-a-red')).toBe('caution')
    expect(color('https://img.shields.io/badge/-a-yellow')).toBe('warning')
    expect(color('https://img.shields.io/badge/-a-orange')).toBe('warning')
    expect(color('https://img.shields.io/badge/-a-blue')).toBe('note')
    expect(color('https://img.shields.io/badge/-a-%23ff69b4')).toBe('important')
    expect(color('https://img.shields.io/badge/-a-FF69B4')).toBe('important')
    expect(color('https://img.shields.io/badge/-a-pink')).toBe('important')
  })

  it('gives no role to any other color', () => {
    expect(color('https://img.shields.io/badge/-a-lightgrey')).toBeUndefined()
    expect(color('https://img.shields.io/badge/-a-%23123456')).toBeUndefined()
  })

  it('lets the `color` option win over the path color', () => {
    expect(color('https://img.shields.io/badge/-a-lightgrey?color=blue')).toBe('note')
    expect(color('https://img.shields.io/badge/-a-blue?colorB=000000')).toBeUndefined()
  })
})

describe('parseShield: other static badges', () => {
  it('reads a two-part badge as message and color, with no label', () => {
    expect(
      parseShield(
        'https://img.shields.io/badge/chromatic-171c23.svg?style=flat&colorA=000000&colorB=000000&logo=chromatic&logoColor=ffffff',
      ),
    ).toEqual({
      label: undefined,
      message: 'chromatic',
      color: undefined, // black on black
      logo: 'chromatic',
    })
  })

  it('reads a three-part badge as label, message and color', () => {
    expect(parseShield('https://img.shields.io/badge/github-repo-blue?logo=github')).toEqual({
      label: 'github',
      message: 'repo',
      color: 'note',
      logo: 'github',
    })
  })

  it('reads a static/v1 badge, with an empty label', () => {
    expect(
      parseShield(
        'https://img.shields.io/static/v1?message=Storybook&style=flat&colorA=000000&colorB=000000&label=&logo=storybook&logoColor=ffffff',
      ),
    ).toEqual({
      label: undefined,
      message: 'Storybook',
      color: 'storybook', // not black: its brand's
      logo: 'storybook',
    })
  })

  it('reads a static/v1 badge whose query starts with `?&`, with a label', () => {
    expect(
      parseShield(
        'https://img.shields.io/static/v1?&message=Open%20in%20%20Codespaces&style=flat&colorA=000000&colorB=000000&label=GitHub&logo=github&logoColor=ffffff',
      ),
    ).toEqual({
      label: 'GitHub',
      message: 'Open in Codespaces',
      color: undefined,
      logo: 'github',
    })
  })
})

describe('parseShield: brands with a color of their own', () => {
  it('gives a storybook badge its color and logo, by message or by logo, whatever its color', () => {
    const storybook = { color: 'storybook', logo: 'storybook' }
    expect(parseShield('https://img.shields.io/badge/-storybook-%23ff69b4')).toMatchObject({
      message: 'storybook',
      ...storybook,
    })
    expect(parseShield('https://img.shields.io/badge/-Storybook-000000')).toMatchObject(storybook)
    expect(parseShield('https://img.shields.io/badge/docs-here-blue?logo=Storybook')).toMatchObject(
      { label: 'docs', message: 'here', ...storybook },
    )
  })

  it('leaves other pink badges `important`', () => {
    expect(parseShield('https://img.shields.io/badge/-demo-%23ff69b4')?.color).toBe('important')
  })
})

describe('parseShield: live badges, their name only', () => {
  it('reads an npm version badge as "npm", with the npm logo', () => {
    expect(
      parseShield(
        'https://img.shields.io/npm/v/@react-three/drei?style=flat&colorA=000000&colorB=000000',
      ),
    ).toEqual({ message: 'npm', color: undefined, logo: 'npm' })
    expect(parseShield('https://img.shields.io/npm/v/three')).toMatchObject({ message: 'npm' })
  })

  it('reads an npm downloads badge as "downloads", `.svg` suffix or not', () => {
    const expected = { message: 'downloads', color: undefined, logo: undefined }
    expect(
      parseShield(
        'https://img.shields.io/npm/dt/@react-three/drei.svg?style=flat&colorA=000000&colorB=000000',
      ),
    ).toEqual(expected)
    expect(parseShield('https://img.shields.io/npm/d18m/@react-three/drei')).toEqual(expected)
  })

  it('reads a discord badge as its label, "discord" when it has none', () => {
    expect(
      parseShield(
        'https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff',
      ),
    ).toEqual({ message: 'discord', color: undefined, logo: 'discord' })
    expect(
      parseShield('https://img.shields.io/discord/740090768164651008?label=chat&logo=discord'),
    ).toMatchObject({ message: 'chat', logo: 'discord' })
    expect(
      parseShield('https://img.shields.io/discord/740090768164651008?label=&logo=discord'),
    ).toMatchObject({ message: 'discord', logo: 'discord' })
    expect(parseShield('https://img.shields.io/discord/740090768164651008')).toMatchObject({
      message: 'discord',
      logo: 'discord',
    })
  })

  it('reads any other endpoint as its usual label, or its first path segment', () => {
    const message = (src: string) => parseShield(src)?.message
    expect(message('https://img.shields.io/npm/l/@react-three/drei')).toBe('license')
    expect(message('https://img.shields.io/github/stars/pmndrs/drei')).toBe('stars')
    expect(message('https://img.shields.io/github/v/release/pmndrs/drei')).toBe('release')
    expect(message('https://img.shields.io/bundlephobia/minzip/zustand')).toBe('minzipped size')
    expect(message('https://img.shields.io/codecov/c/github/pmndrs/zustand')).toBe('codecov')
    expect(message('https://img.shields.io/github/stars/pmndrs/drei?label=Stars')).toBe('Stars')
  })

  it('keeps the logo and color options of a live badge', () => {
    expect(
      parseShield('https://img.shields.io/github/stars/pmndrs/drei?logo=github&color=yellow'),
    ).toEqual({ message: 'stars', color: 'warning', logo: 'github' })
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
