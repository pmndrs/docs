import cn from '@/lib/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, CSSProperties } from 'react'

//
// Swatches of the theme's color roles, as Material's scheme poster shows them: a cell of the
// role's color, its name on it in the color of what goes on it. The colors are the
// `--md-sys-color-*` variables `<Mtb>` writes (see `src/app/layout.tsx`): the Material 3 roles,
// and the custom colors the layout passes it, `note`, `tip`… — any other custom color given to
// `<Mtb>` works too, with no change here.
//
// Two dumb pieces, composed in MDX: a `Color` is a swatch — a disc inline in text, like a badge, or
// a cell — and a `ColorGroup` fuses cells into one rounded block. Laying blocks side by side is the
// page's business, not the group's.
//

const colorGroupVariants = cva(
  // `grid!`: as a direct child of the page (`.post-container > *`, globals.css), the group would
  // be made `display: block` otherwise, its columns stacked.
  //
  // `my-4`: a block in the flow of the page, spaced as the other blocks are (`Details`, `Gha`).
  //
  // `gap-px`: a hairline of the page between the cells, as on Material's scheme poster.
  //
  // The block is the one rounded and spaced: a cell in it loses its rounding and its square ratio
  // (it fills its cell of the grid), a nested group (a row of the block) its rounding and margins —
  // either would round where it meets its siblings. `overflow-hidden` clips.
  'my-4 grid! auto-cols-fr gap-px overflow-hidden rounded-lg [&_[data-slot=color]]:aspect-auto [&_[data-slot=color]]:m-0 [&_[data-slot=color]]:rounded-none [&>[data-slot=color-group]]:m-0 [&>[data-slot=color-group]]:rounded-none',
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
 * The rounding and the margins are the block's (`overflow-hidden`): a cell loses its rounding
 * and its square ratio in a group, a nested group its rounding and margins — a row of the block,
 * it would otherwise round where it meets its siblings.
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
 * - `variant`: `pill` (the default), a disc inline in text, no label (the role is its `title`) —
 *   the theme-color swatch of the site's controls too, see `PrimaryColorPicker`; `cell` and `on`, the cells of a
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

  return (
    <span
      data-slot="color"
      title={role}
      {...props}
      style={{ ...colors, ...style }}
      className={cn(colorVariants({ variant, size }), className)}
    >
      {!isPill && (children ?? (role && titleCase(role)))}
    </span>
  )
}
