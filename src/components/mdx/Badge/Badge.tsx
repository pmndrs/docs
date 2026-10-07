import { Badge as UiBadge } from '@/components/ui/badge'
import type { CSSProperties, ReactNode } from 'react'
import { linkProps } from '../Link/linkProps'
import { brandIcons } from './icons'

/**
 * A color role of the theme `<Mtb>` builds (see `src/app/layout.tsx`): its system roles, or
 * one of the custom colors the layout passes it. Any other custom color given to `<Mtb>`
 * works too, with no change here. Or a brand color, one of `brandColors`.
 */
export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'note'
  | 'tip'
  | 'important'
  | 'warning'
  | 'caution'
  | 'storybook'
  | 'npm'
  | 'chromatic'
  | (string & {})

/**
 * The brand colors the layout exposes as is, `--brand-<color>` (see `src/app/layout.tsx`): a
 * Material tone of them would be a muted pink, not the brand.
 */
const brandColors: BadgeColor[] = ['storybook', 'npm', 'chromatic']

/**
 * The badge is shadcn's `secondary` variant, whose colors are the `--secondary` and
 * `--secondary-foreground` variables — `secondary-container` and `on-secondary-container`
 * once `material-theme-builder/shadcn.css` maps them. A color re-points them, on the badge
 * only, at the main pair of a role, `<role>` and `on-<role>`: the variant's background, text
 * and link hover follow, and a role needs no class of its own. The main pair, not the
 * container one: every role's container is a pale tone in light mode, the roles hard to tell
 * apart. A role the theme does not have falls back to the uncolored look.
 *
 * A brand color re-points them at the brand color, with white on it, in light and dark alike,
 * as the brands and shields.io have it.
 */
function colorVars(color: BadgeColor) {
  if (brandColors.includes(color)) {
    return {
      '--secondary': `var(--brand-${color})`,
      '--secondary-foreground': 'white',
    } as CSSProperties
  }

  return {
    '--secondary': `var(--md-sys-color-${color}, var(--md-sys-color-secondary-container))`,
    '--secondary-foreground': `var(--md-sys-color-on-${color}, var(--md-sys-color-on-secondary-container))`,
  } as CSSProperties
}

/**
 * A tag, e.g. "storybook" or "suspense", usually under the page title. Inline, like a link.
 *
 * - `href`: links to it
 * - `color`: a color role of the theme — the `secondary` look otherwise
 * - `label`: a de-emphasized label before the message, as in "GitHub Open in Codespaces"
 * - `logo`: a brand logo before it all, by its simple-icons slug, e.g. `github`.
 *   An unknown slug shows no logo.
 */
export function Badge({
  href,
  color,
  label,
  logo,
  children,
}: {
  href?: string
  color?: BadgeColor
  label?: string
  logo?: string
  children: ReactNode
}) {
  const icon = logo ? brandIcons[logo] : undefined

  return (
    <UiBadge
      variant="secondary"
      // Inline in a line of text: centered on it, the same with or without a logo — on its
      // baseline, a badge starting with an svg would take the svg's bottom edge for its own
      className="align-middle"
      style={color ? colorVars(color) : undefined}
      render={href ? <a {...linkProps(href)} /> : undefined}
    >
      {icon && (
        <svg data-icon="inline-start" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={icon.path} />
        </svg>
      )}
      {label && <span className="opacity-70">{label}</span>}
      {children}
    </UiBadge>
  )
}
