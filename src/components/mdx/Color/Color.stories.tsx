import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mtb } from 'material-theme-builder/react'
import type { CSSProperties } from 'react'

import { ColorGroup, Color } from './Color'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: ColorGroup,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
  decorators: [
    // The theme the website builds in `src/app/layout.tsx`, with its default colors: the
    // swatches are its tokens, the custom colors included, and its brand colors as is.
    (Story) => (
      <Mtb
        source="#323e48"
        scheme="tonalSpot"
        customColors={[
          { name: 'note', hex: '#1f6feb', blend: true },
          { name: 'tip', hex: '#238636', blend: true },
          { name: 'important', hex: '#8957e5', blend: true },
          { name: 'warning', hex: '#d29922', blend: true },
          { name: 'caution', hex: '#da3633', blend: true },
        ]}
      >
        <div
          className="bg-surface p-8 text-on-surface"
          style={
            {
              '--brand-storybook': '#ff4785',
              '--brand-npm': '#cb3837',
              '--brand-chromatic': '#fc521f',
            } as CSSProperties
          }
        >
          <Story />
        </div>
      </Mtb>
    ),
  ],
} satisfies Meta<typeof ColorGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A color is a pill, inline in text like a badge: a disc of the role's color, the role as its
 * tooltip.
 */
export const Default: Story = {
  render: () => (
    <p className="max-w-xl text-sm">
      The four accents of the theme, <Color role="primary" /> <Color role="secondary" />{' '}
      <Color role="tertiary" /> and <Color role="error" />, one of its custom colors,{' '}
      <Color role="tip" />, and a color of no role at all: <Color color="#cb3837" />.
    </p>
  ),
}

/**
 * A cell: a rounded square, as a `ColorGroup` fuses them.
 */
export const Cell: Story = {
  render: () => <Color role="inverse-primary" variant="cell" />,
}

/**
 * A role and the role that goes on it, as a strip under the cell: a vertical group.
 */
export const Pair: Story = {
  render: (args) => (
    <ColorGroup {...args} orientation="vertical" className="max-w-xs">
      <Color role="primary" variant="cell" />
      <Color role="on-primary" variant="on" />
    </ColorGroup>
  ),
}

/**
 * The fixed family: two cells side by side in a nested horizontal group, a row of the block, then
 * the two `on` strips.
 */
export const Composite: Story = {
  render: (args) => (
    <ColorGroup {...args} orientation="vertical" className="max-w-xs">
      <ColorGroup>
        <Color role="secondary-fixed" variant="cell" />
        <Color role="secondary-fixed-dim" variant="cell" />
      </ColorGroup>
      <Color role="on-secondary-fixed" variant="on" />
      <Color role="on-secondary-fixed-variant" variant="on" />
    </ColorGroup>
  ),
}

/**
 * The four accent roles side by side: four groups, a plain flex wrapper (story scaffolding) laying
 * them out, a gap between them.
 */
export const Row: Story = {
  render: (args) => (
    <div className="flex gap-2">
      {['primary', 'secondary', 'tertiary', 'error'].map((role) => (
        <ColorGroup key={role} {...args} orientation="vertical" className="flex-1">
          <Color role={role} variant="cell" />
          <Color role={`on-${role}`} variant="on" />
        </ColorGroup>
      ))}
    </div>
  ),
}

/**
 * A custom color given to `<Mtb>`, `tip`: its four roles, as material-theme-builder lists them,
 * each a cell of its own, a plain flex wrapper (story scaffolding) laying them out.
 */
export const Custom: Story = {
  render: () => (
    <div className="flex items-start gap-2">
      <Color role="tip" variant="cell" />
      <Color role="on-tip" variant="cell" />
      <Color role="tip-container" variant="cell" />
      <Color role="on-tip-container" variant="cell" />
    </div>
  ),
}

/**
 * Any CSS color, not a role of the theme: a hex, a brand variable of the layout — and, with no
 * label, a plain disc.
 */
export const Brand: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Color color="#cb3837" />
      <Color color="var(--brand-storybook)" />
      <Color color="#cb3837" variant="cell">
        npm
      </Color>
    </div>
  ),
}

/**
 * The three sizes, `sm`, `md` (the default) and `lg`: the diameter of a pill, the side of a cell.
 */
export const Sizes: Story = {
  render: () => (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Color key={size} role="primary" size={size} />
        ))}
      </div>
      <div className="flex items-start gap-2">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Color key={size} role="primary" variant="cell" size={size}>
            {size}
          </Color>
        ))}
      </div>
    </div>
  ),
}

// The three accents; `error` is laid out apart, in its own column
const accents = ['primary', 'secondary', 'tertiary']
const surfaces = ['surface-dim', 'surface', 'surface-bright']
const surfaceContainers = [
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
]
const onSurfaces = ['on-surface', 'on-surface-variant', 'outline', 'outline-variant']
// The custom colors the meta decorator gives `<Mtb>`
const customColors = ['note', 'tip', 'important', 'warning', 'caution']
const palettes = [
  'primary',
  'secondary',
  'tertiary',
  'error',
  'neutral',
  'neutral-variant',
  ...customColors,
]
// material-theme-builder's `STANDARD_TONES`, light to dark as its poster lists them
const tones = [
  100, 99, 98, 96, 95, 94, 92, 90, 87, 80, 70, 60, 50, 40, 35, 30, 25, 24, 22, 20, 17, 15, 12, 10,
  6, 5, 4, 0,
]

/**
 * The scheme poster, the doc page's poster: material-theme-builder's grid, three accents wide and
 * the error column, light or dark depending on the ancestor.
 */
function Scheme() {
  return (
    <div className="grid grid-cols-[3fr_1fr] gap-2">
      <ColorGroup>
        {accents.map((role) => (
          <ColorGroup key={role} orientation="vertical">
            <Color role={role} variant="cell" />
            <Color role={`on-${role}`} variant="on" />
            <Color role={`${role}-container`} variant="cell" />
            <Color role={`on-${role}-container`} variant="on" />
          </ColorGroup>
        ))}
      </ColorGroup>
      <ColorGroup orientation="vertical">
        <Color role="error" variant="cell" />
        <Color role="on-error" variant="on" />
        <Color role="error-container" variant="cell" />
        <Color role="on-error-container" variant="on" />
      </ColorGroup>
      <ColorGroup>
        {accents.map((role) => (
          <ColorGroup key={role} orientation="vertical">
            <ColorGroup>
              <Color role={`${role}-fixed`} variant="cell" />
              <Color role={`${role}-fixed-dim`} variant="cell" />
            </ColorGroup>
            <Color role={`on-${role}-fixed`} variant="on" />
            <Color role={`on-${role}-fixed-variant`} variant="on" />
          </ColorGroup>
        ))}
      </ColorGroup>
      <div />
      <ColorGroup orientation="vertical">
        <ColorGroup>
          {surfaces.map((role) => (
            <Color key={role} role={role} variant="cell" />
          ))}
        </ColorGroup>
        <ColorGroup>
          {surfaceContainers.map((role) => (
            <Color key={role} role={role} variant="cell" />
          ))}
        </ColorGroup>
        <ColorGroup>
          {onSurfaces.map((role) => (
            <Color key={role} role={role} variant="on" />
          ))}
        </ColorGroup>
      </ColorGroup>
      <ColorGroup orientation="vertical">
        <Color role="inverse-surface" variant="cell" />
        <Color role="inverse-on-surface" variant="on" />
        <Color role="inverse-primary" variant="on" />
        <ColorGroup>
          <Color role="scrim" variant="on" />
          <Color role="shadow" variant="on" />
        </ColorGroup>
      </ColorGroup>
      <ColorGroup orientation="vertical" className="col-span-2">
        {customColors.map((color) => (
          <ColorGroup key={color}>
            <Color role={color} variant="cell" />
            <Color role={`on-${color}`} variant="cell" />
            <Color role={`${color}-container`} variant="cell" />
            <Color role={`on-${color}-container`} variant="cell" />
          </ColorGroup>
        ))}
      </ColorGroup>
    </div>
  )
}

/**
 * The tonal palettes, `--md-ref-palette-<palette>-<tone>`: the same in light and dark.
 */
function Shades() {
  return (
    <div className="grid gap-4">
      {palettes.map((palette) => (
        <div key={palette}>
          <p className="mb-1 text-sm font-medium">{palette}</p>
          <ColorGroup>
            {tones.map((tone) => (
              <Color
                key={tone}
                color={`var(--md-ref-palette-${palette}-${tone})`}
                ink={tone >= 70 ? 'black' : 'white'}
                variant="cell"
                size="sm"
                className="px-0 text-center text-[0.625rem] text-clip"
              >
                {tone}
              </Color>
            ))}
          </ColorGroup>
        </div>
      ))}
    </div>
  )
}

/**
 * material-theme-builder's whole scheme poster, light then dark, then the tonal palettes — out of
 * `Color`, `ColorGroup` and plain grid scaffolding.
 */
export const Poster: Story = {
  render: () => (
    <div className="grid gap-6">
      <div className="rounded-xl bg-surface p-6 text-on-surface">
        <h2 className="mb-4 text-lg font-medium">Light scheme</h2>
        <Scheme />
      </div>
      <div className="dark rounded-xl bg-surface p-6 text-on-surface">
        <h2 className="mb-4 text-lg font-medium">Dark scheme</h2>
        <Scheme />
      </div>
      <Shades />
    </div>
  ),
}
