import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@savvywombat/tailwindcss-grid-areas'),
  ],
  theme: {
    extend: {
      gridTemplateAreas: {
        'layout-1col': ['h h', 'm m'],
        'layout-2cols': ['h h', 'n m'],
        'layout-3cols': ['h h h', 'n m t'],
      },
    },
  },
}

export default config
