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
// Only what the URL declares is kept: label, message, and `logo=<slug>`. Colors are
// not: the badge is neutral, and a color is for the author to declare, `<Badge color>`. A
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
 * What a badge shows, as `<Badge>` props.
 */
export type ShieldBadge = {
  label?: string
  message: string
  /** A simple-icons slug, from `logo=` */
  logo?: string
}

/**
 * Reads a shields.io badge URL, or returns `undefined` for any other URL.
 *
 * @example
 * parseShield('https://img.shields.io/badge/-suspense-brightgreen')
 * // { label: undefined, message: 'suspense', logo: undefined }
 */
export function parseShield(src: unknown): ShieldBadge | undefined {
  if (!isShield(src)) return undefined

  const url = new URL(src)
  const [base, ...rest] = safeDecode(url.pathname.replace(/\.svg$/, ''))
    .split('/')
    .slice(1)
  const query = url.searchParams

  // An explicit `label=` wins, even empty
  const label = query.has('label') ? text(query.get('label')) : undefined
  const logo = query.get('logo') || undefined

  //
  // /badge/<message>-<color>, /badge/<label>-<message>-<color>
  //

  if (base === 'badge' && rest.length === 1) {
    const parts = splitBadgeContent(rest[0])
    if (parts.length < 2 || parts.length > 3) return undefined
    const [pathLabel, pathMessage] = parts.length === 3 ? parts : [undefined, ...parts]
    const message = text(pathMessage)
    if (!message) return undefined

    return { label: query.has('label') ? label : text(pathLabel), message, logo }
  }

  //
  // /static/v1?label=&message=&color=
  //

  if (base === 'static' && rest.length === 1 && rest[0] === 'v1') {
    const message = text(query.get('message'))
    if (!message) return undefined

    return { label, message, logo }
  }

  //
  // Any other endpoint is live, e.g. /npm/v/<package>, /discord/<server id>: its name, not its
  // value
  //

  if (base === 'badge' || base === 'static' || !base) return undefined // malformed static badge

  return { message: label ?? liveLabel([base, ...rest]), logo }
}

/**
 * The usual label of live endpoints, by path prefix, as shields.io shows it. Any other endpoint
 * is named after its first path segment, e.g. "codecov".
 */
const LIVE_LABELS: { prefix: string; label: string }[] = [
  { prefix: 'npm/v', label: 'npm' },
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
  { prefix: 'discord', label: 'discord' },
]

function liveLabel(segments: string[]) {
  const path = segments.join('/')
  const [endpoint] = LIVE_LABELS.filter(
    ({ prefix }) => path === prefix || path.startsWith(`${prefix}/`),
  ).sort((a, b) => b.prefix.length - a.prefix.length) // the most specific
  return endpoint?.label ?? segments[0]
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

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
