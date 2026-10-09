import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, CSSProperties } from 'react'

//
// Swatches of the theme's color roles, as Material's scheme poster shows them: a cell of the
// role's color, its name on it in the color of what goes on it. The colors are the
// `--md-sys-color-*` variables of the Material 3 palette that `pmndrs/design-system/theme` bakes
// (or an `<Mtb>` of material-theme-builder): its roles, and any custom color given to the palette,
// `lime`, `note`…, with no change here.
//
// Two dumb pieces, composed in MDX: a `Color` is a swatch — a disc inline in text, like a badge, or
// a cell — and a `ColorGroup` fuses cells into one rounded block. Laying blocks side by side is the
// page's business, not the group's.
//

const colorGroupVariants = cva(
  // No margin: spacing a group in the flow of a page is the page's business, so a wrapper laying
  // groups out, or a group nesting one, needs no reset.
  //
  // `gap-px`: a hairline of the page between the cells, as on Material's scheme poster.
  //
  // The block is the one rounded: a cell in it loses its rounding and its square ratio (it fills
  // its cell of the grid), a nested group (a row of the block) its rounding — either would round
  // where it meets its siblings. `overflow-hidden` clips.
  'grid auto-cols-fr gap-px overflow-hidden rounded-lg [&_[data-slot=color]]:aspect-auto [&_[data-slot=color]]:rounded-none [&>[data-slot=color-group]]:rounded-none',
  {
    variants: {
      orientation: {
        // Columns of equal width
        horizontal: 'grid-flow-col',
        // One column
        vertical: 'grid-flow-row',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

/**
 * Cells fused into one rounded block, a hairline apart as on Material's scheme poster: a role and the
 * role that goes on it, "Primary Fixed | Primary Fixed Dim" above its two `on` strips. A group
 * nests in a group as a row of the block, nothing more: laying several blocks side by side is the
 * page's layout, a plain flex or grid wrapper does it.
 *
 * - `orientation`: `horizontal` (the default), the children side by side in columns of equal
 *   width, each as tall as the group; `vertical`, stacked, each as wide as the group.
 *
 * The rounding is the block's (`overflow-hidden`): a cell loses its rounding and its square
 * ratio in a group, a nested group its rounding — a row of the block, it would otherwise round
 * where it meets its siblings. The margins are the page's: a group has none, so a wrapper laying
 * groups out needs no reset.
 */
export function ColorGroup({
  orientation = 'horizontal',
  className,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof colorGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="color-group"
      data-orientation={orientation}
      {...props}
      className={cn(colorGroupVariants({ orientation }), className)}
    />
  )
}

/**
 * The role of the text on a role's cell: the one Material pairs it with.
 *
 * Mostly `on-<role>`, and `<role>` back for `on-<role>` — the fixed and surface families
 * aside, where the pairs are not symmetric: `primary-fixed-dim` is paired with
 * `on-primary-fixed`, `on-primary-fixed-variant` with `primary-fixed`, every surface with
 * `on-surface`, the outlines with `surface`. `scrim` and `shadow` have no pair: `white`, a
 * literal, is returned for them.
 */
export function inkOf(role: string): string {
  if (role === 'scrim' || role === 'shadow') return 'white'

  if (role === 'inverse-surface') return 'inverse-on-surface'
  if (role === 'inverse-on-surface') return 'inverse-surface'
  if (role === 'inverse-primary') return 'on-surface'

  if (role === 'on-surface' || role === 'on-surface-variant') return 'surface'
  if (role === 'outline' || role === 'outline-variant') return 'surface'
  if (role === 'surface' || role.startsWith('surface-')) return 'on-surface'

  const fixedVariant = role.match(/^on-(.+)-fixed-variant$/)
  if (fixedVariant) return `${fixedVariant[1]}-fixed`

  const fixedDim = role.match(/^(.+)-fixed-dim$/)
  if (fixedDim) return `on-${fixedDim[1]}-fixed`

  if (role.startsWith('on-')) return role.slice('on-'.length)

  return `on-${role}`
}

/**
 * A CSS color for a role, or a CSS color as is: `white` is the one literal `inkOf` returns.
 */
function colorOf(token: string) {
  return token === 'white' ? 'white' : `var(--md-sys-color-${token})`
}

/**
 * "on-primary-fixed-variant" as "On Primary Fixed Variant".
 */
function titleCase(role: string) {
  return role
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// A `span`, inline, valid in a paragraph: a disc in a line of text, or a cell of a `ColorGroup`,
// which takes the rounding and the square ratio away from the cells it fuses, each then filling
// its cell of the grid.
const colorVariants = cva('inline-block align-middle leading-none', {
  variants: {
    variant: {
      // A disc of the color, no label: the role is its `title`
      pill: 'rounded-full border',
      // A role's cell: a rounded square of `size`
      cell: 'aspect-square truncate rounded-lg p-2 text-xs',
      // The strip of what goes on a cell, as tall as its label
      on: 'truncate rounded-lg p-2 text-xs',
    },
    // The height of a pill, the side of a cell; an `on` strip ignores it, see `compoundVariants`
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    { variant: 'pill', size: 'sm', class: 'size-4' },
    { variant: 'pill', size: 'md', class: 'size-5' },
    { variant: 'pill', size: 'lg', class: 'size-6' },
    { variant: 'cell', size: 'sm', class: 'h-12' },
    { variant: 'cell', size: 'md', class: 'h-20' },
    { variant: 'cell', size: 'lg', class: 'h-32' },
  ],
  defaultVariants: {
    variant: 'pill',
    size: 'md',
  },
})

type ColorProps = ComponentProps<'span'> &
  VariantProps<typeof colorVariants> & {
    /**
     * A color role of the theme, in kebab-case: `primary`, `on-primary-fixed-variant`,
     * `surface-container-high`, or a custom color, `tip`, `on-tip-container`. Its
     * `--md-sys-color-<role>` variable is the background, the role in Title Case the label.
     * Shadows the ARIA `role` attribute, which the component sets itself (`img` for a pill).
     */
    role?: string
    /**
     * The role of the text, in kebab-case — the one Material pairs with `role` otherwise, see
     * `inkOf`. With `color`, a CSS color as is, `white` by default.
     */
    ink?: string
    /**
     * Any CSS color, as is, e.g. `#cb3837` or `var(--brand-npm)`: a color that is not a role of
     * the theme. Wins over `role`, which then only gives the label.
     */
    color?: string
  }

/**
 * A swatch of a role's color: a disc, or a cell with the role's name on it — in Title Case, or
 * `children`.
 *
 * - `role`: a color role of the theme, its background — and, through `inkOf`, its text color
 * - `ink`: the text color, as a role; or as any CSS color along with `color`
 * - `color`: any CSS color as the background, for a color that is not a role of the theme
 * - `variant`: `pill` (the default), a disc inline in text, no label: the label is its `title` and
 *   its accessible name (`role="img"`), or the disc is decorative (`aria-hidden`) with neither
 *   `role` nor `children`, e.g. the swatch of a color picker; `cell` and `on`, the cells of a
 *   `ColorGroup`, a rounded square of `size` and the strip, as tall as its label, of the role that
 *   goes on the cell above it. A cell says so explicitly, as a `Button` carries its `variant` in a
 *   `ButtonGroup`.
 * - `size`: the diameter of a pill, the side of a cell — `sm`, `md` (the default), `lg`; an `on`
 *   strip ignores it
 */
export function Color({
  role,
  ink,
  color,
  variant,
  size,
  className,
  style,
  children,
  ...props
}: ColorProps) {
  const isPill = (variant ?? 'pill') === 'pill'
  const colors: CSSProperties = color
    ? { backgroundColor: color, color: ink ?? 'white' }
    : role
      ? { backgroundColor: colorOf(role), color: colorOf(ink ?? inkOf(role)) }
      : {}

  // The label: `children` when it is a string, else the role in Title Case. A pill carries it as
  // its `title` and accessible name, a cell or a strip shows it.
  const label = typeof children === 'string' ? children : role ? titleCase(role) : undefined

  // A pill is an image of its label — or, with no label (a `color`-only disc, the picker's
  // swatch), decorative: whatever contains it names it.
  const pillA11y = isPill
    ? label
      ? { role: 'img', 'aria-label': label }
      : { 'aria-hidden': true }
    : {}

  return (
    <span
      data-slot="color"
      title={label}
      {...props}
      {...pillA11y}
      style={{ ...colors, ...style }}
      className={cn(colorVariants({ variant, size }), className)}
    >
      {!isPill && (children ?? (role && titleCase(role)))}
    </span>
  )
}
