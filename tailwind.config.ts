import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: 'class',
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@savvywombat/tailwindcss-grid-areas'),
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Inconsolata"', ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'collapsible-down': 'collapsible-down var(--collapsible-down-duration, 0s) ease-out',
        'collapsible-up': 'collapsible-up var(--collapsible-up-duration, 0s) ease-out',
      },
      gridTemplateAreas: {
        'layout-1col': [
          //
          'h h',
          'm m',
        ],
        'layout-2cols': [
          //
          'h h',
          'n m',
        ],
        'layout-3cols': [
          //
          'h h h',
          'n m t',
        ],
      },
      colors: {
        // Material Design colors provided by react-mcu
        // See: https://github.com/abernier/react-mcu
        background: 'var(--mcu-background)',
        'on-background': 'var(--mcu-on-background)',
        surface: 'var(--mcu-surface)',
        'surface-dim': 'var(--mcu-surface-dim)',
        'surface-bright': 'var(--mcu-surface-bright)',
        'surface-container-lowest': 'var(--mcu-surface-container-lowest)',
        'surface-container-low': 'var(--mcu-surface-container-low)',
        'surface-container': 'var(--mcu-surface-container)',
        'surface-container-high': 'var(--mcu-surface-container-high)',
        'surface-container-highest': 'var(--mcu-surface-container-highest)',
        'on-surface': 'var(--mcu-on-surface)',
        'on-surface-variant': 'var(--mcu-on-surface-variant)',
        outline: 'var(--mcu-outline)',
        'outline-variant': 'var(--mcu-outline-variant)',
        'inverse-surface': 'var(--mcu-inverse-surface)',
        'inverse-on-surface': 'var(--mcu-inverse-on-surface)',
        primary: 'var(--mcu-primary)',
        'on-primary': 'var(--mcu-on-primary)',
        'primary-container': 'var(--mcu-primary-container)',
        'on-primary-container': 'var(--mcu-on-primary-container)',
        'primary-fixed': 'var(--mcu-primary-fixed)',
        'primary-fixed-dim': 'var(--mcu-primary-fixed-dim)',
        'on-primary-fixed': 'var(--mcu-on-primary-fixed)',
        'on-primary-fixed-variant': 'var(--mcu-on-primary-fixed-variant)',
        'inverse-primary': 'var(--mcu-inverse-primary)',
        secondary: 'var(--mcu-secondary)',
        'on-secondary': 'var(--mcu-on-secondary)',
        'secondary-container': 'var(--mcu-secondary-container)',
        'on-secondary-container': 'var(--mcu-on-secondary-container)',
        'secondary-fixed': 'var(--mcu-secondary-fixed)',
        'secondary-fixed-dim': 'var(--mcu-secondary-fixed-dim)',
        'on-secondary-fixed': 'var(--mcu-on-secondary-fixed)',
        'on-secondary-fixed-variant': 'var(--mcu-on-secondary-fixed-variant)',
        tertiary: 'var(--mcu-tertiary)',
        'on-tertiary': 'var(--mcu-on-tertiary)',
        'tertiary-container': 'var(--mcu-tertiary-container)',
        'on-tertiary-container': 'var(--mcu-on-tertiary-container)',
        'tertiary-fixed': 'var(--mcu-tertiary-fixed)',
        'tertiary-fixed-dim': 'var(--mcu-tertiary-fixed-dim)',
        'on-tertiary-fixed': 'var(--mcu-on-tertiary-fixed)',
        'on-tertiary-fixed-variant': 'var(--mcu-on-tertiary-fixed-variant)',
        error: 'var(--mcu-error)',
        'on-error': 'var(--mcu-on-error)',
        'error-container': 'var(--mcu-error-container)',
        'on-error-container': 'var(--mcu-on-error-container)',
        scrim: 'var(--mcu-scrim)',
        shadow: 'var(--mcu-shadow)',
        // Custom colors for alerts
        note: 'var(--mcu-note)',
        'on-note': 'var(--mcu-on-note)',
        'note-container': 'var(--mcu-note-container)',
        'on-note-container': 'var(--mcu-on-note-container)',
        tip: 'var(--mcu-tip)',
        'on-tip': 'var(--mcu-on-tip)',
        'tip-container': 'var(--mcu-tip-container)',
        'on-tip-container': 'var(--mcu-on-tip-container)',
        important: 'var(--mcu-important)',
        'on-important': 'var(--mcu-on-important)',
        'important-container': 'var(--mcu-important-container)',
        'on-important-container': 'var(--mcu-on-important-container)',
        warning: 'var(--mcu-warning)',
        'on-warning': 'var(--mcu-on-warning)',
        'warning-container': 'var(--mcu-warning-container)',
        'on-warning-container': 'var(--mcu-on-warning-container)',
        caution: 'var(--mcu-caution)',
        'on-caution': 'var(--mcu-on-caution)',
        'caution-container': 'var(--mcu-caution-container)',
        'on-caution-container': 'var(--mcu-on-caution-container)',
      },
    },
  },
  variants: {
    gridTemplateAreas: ['responsive'],
  },
}

export default config
