//
// shields.io badge URLs, read into what a `<Badge>` shows
//
// Recognized shapes, `.svg` suffix or not:
//
// - static: `/badge/<message>-<color>`, `/badge/<label>-<message>-<color>`,
//   `/static/v1?label=<label>&message=<message>&color=<color>` — label and message as they are
// - live: any other endpoint, e.g. `/npm/v/<package>`, `/npm/dt/<package>`,
//   `/discord/<server id>`. Their value (a version, a count...) is dropped, nothing is fetched:
//   they read their `label=` when it has one, their usual label otherwise — "npm",
//   "downloads", "discord"...
//
// All of them keep their `logo=`, and `color=` (`colorB=`) when it maps to a color role. A
// malformed static badge, or any other URL, is not one: `parseShield` returns `undefined`.
//

const SHIELDS = 'https://img.shields.io/'

/**
 * Whether `src` is a shields.io image, recognized or not.
 */
export function isShield(src: unknown): src is string {
  return typeof src === 'string' && src.startsWith(SHIELDS)
}

/**
 * The shields.io colors that carry a meaning, mapped to the theme's color roles. Any other
 * color, e.g. the black `000000` of a black-on-black badge, gets no role, and the badge keeps
 * its default look.
 */
const ROLES: Record<string, string> = {
  brightgreen: 'tip',
  green: 'tip',
  red: 'caution',
  yellow: 'warning',
  orange: 'warning',
  blue: 'note',
  ff69b4: 'important',
  pink: 'important',
}

/**
 * Brands with a color role of their own (see `customColors` in `src/app/layout.tsx`), by
 * simple-icons slug: a badge of theirs — by its logo, or by its message, as the "storybook"
 * tags — takes that color and logo, whatever its shields.io color.
 */
const BRANDS: Record<string, string> = {
  storybook: 'storybook',
}

/**
 * What a badge shows, as `<Badge>` props.
 */
export type ShieldBadge = {
  label?: string
  message: string
  /** A color role of the theme */
  color?: string
  /** A shields.io / simple-icons slug */
  logo?: string
}

/**
 * Reads a shields.io badge URL, or returns `undefined` for any other URL.
 *
 * @example
 * parseShield('https://img.shields.io/badge/-suspense-brightgreen')
 * // { label: undefined, message: 'suspense', color: 'tip', logo: undefined }
 */
export function parseShield(src: unknown): ShieldBadge | undefined {
  const badge = readShield(src)
  if (!badge) return undefined

  const brand = [badge.logo, badge.message]
    .map((slug) => slug?.toLowerCase())
    .find((slug) => slug !== undefined && slug in BRANDS)
  return brand ? { ...badge, color: BRANDS[brand], logo: brand } : badge
}

function readShield(src: unknown): ShieldBadge | undefined {
  if (!isShield(src)) return undefined

  const url = new URL(src)
  const [base, ...rest] = safeDecode(url.pathname.replace(/\.svg$/, ''))
    .split('/')
    .slice(1)
  const query = url.searchParams

  // An explicit `label=` wins, even empty
  const label = query.has('label') ? text(query.get('label')) : undefined
  const color = (fallback?: string) => role(query.get('color') ?? query.get('colorB') ?? fallback)
  const logo = (fallback?: string) => query.get('logo') || fallback

  //
  // /badge/<message>-<color>, /badge/<label>-<message>-<color>
  //

  if (base === 'badge' && rest.length === 1) {
    const parts = splitBadgeContent(rest[0])
    if (parts.length < 2 || parts.length > 3) return undefined
    const [pathLabel, pathMessage, pathColor] = parts.length === 3 ? parts : [undefined, ...parts]
    const message = text(pathMessage)
    if (!message) return undefined

    return {
      label: query.has('label') ? label : text(pathLabel),
      message,
      color: color(pathColor),
      logo: logo(),
    }
  }

  //
  // /static/v1?label=&message=&color=
  //

  if (base === 'static' && rest.length === 1 && rest[0] === 'v1') {
    const message = text(query.get('message'))
    if (!message) return undefined

    return { label, message, color: color(), logo: logo() }
  }

  //
  // Any other endpoint is live, e.g. /npm/v/<package>, /discord/<server id>: its name, not its
  // value
  //

  if (base === 'badge' || base === 'static' || !base) return undefined // malformed static badge

  const endpoint = liveEndpoint([base, ...rest])
  return { message: label ?? endpoint.label, color: color(), logo: logo(endpoint.logo) }
}

/**
 * The usual label of live endpoints, by path prefix, and the logo of those named after a
 * brand. Any other endpoint is named after its first path segment, e.g. "codecov".
 */
const LIVE_ENDPOINTS: { prefix: string; label: string; logo?: string }[] = [
  { prefix: 'npm/v', label: 'npm', logo: 'npm' },
  { prefix: 'npm/dt', label: 'downloads' },
  { prefix: 'npm/dw', label: 'downloads' },
  { prefix: 'npm/dm', label: 'downloads' },
  { prefix: 'npm/dy', label: 'downloads' },
  { prefix: 'npm/d18m', label: 'downloads' },
  { prefix: 'npm/l', label: 'license' },
  { prefix: 'npm/types', label: 'types' },
  { prefix: 'bundlephobia/min', label: 'minified size' },
  { prefix: 'bundlephobia/minzip', label: 'minzipped size' },
  { prefix: 'github/stars', label: 'stars' },
  { prefix: 'github/forks', label: 'forks' },
  { prefix: 'github/license', label: 'license' },
  { prefix: 'github/v/release', label: 'release' },
  { prefix: 'github/v/tag', label: 'tag' },
  { prefix: 'github/last-commit', label: 'last commit' },
  { prefix: 'github/contributors', label: 'contributors' },
  { prefix: 'github/actions/workflow/status', label: 'build' },
  { prefix: 'discord', label: 'discord', logo: 'discord' },
]

function liveEndpoint(segments: string[]) {
  const path = segments.join('/')
  const [endpoint] = LIVE_ENDPOINTS.filter(
    ({ prefix }) => path === prefix || path.startsWith(`${prefix}/`),
  ).sort((a, b) => b.prefix.length - a.prefix.length) // the most specific
  return endpoint ?? { label: segments[0] }
}

/**
 * The parts of a `/badge/` path segment. shields.io escaping: `--` is a literal dash, a single
 * `-` separates the parts, `__` is a literal underscore and a single `_` a space.
 */
function splitBadgeContent(content: string) {
  const DASH = '\u0000'
  const UNDERSCORE = '\u0001'

  return content
    .replaceAll('--', DASH)
    .split('-')
    .map((part) =>
      part
        .replaceAll(DASH, '-')
        .replaceAll('__', UNDERSCORE)
        .replaceAll('_', ' ')
        .replaceAll(UNDERSCORE, '_'),
    )
}

/**
 * Whitespace-collapsed text — a no-break space counting as one —, or `undefined` if empty.
 */
function text(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() || undefined
}

/**
 * The color role of a shields.io color, `#ff69b4` or `ff69b4` alike.
 */
function role(color: string | undefined) {
  if (!color) return undefined
  return ROLES[color.replace(/^#/, '').toLowerCase()]
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
