import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/aspect-ratio')],
  theme: {
    extend: {
      colors: {
        // Map shadcn sidebar colors to Material Design tokens
        sidebar: {
          DEFAULT: 'hsl(var(--color-surface))',
          foreground: 'hsl(var(--color-on-surface))',
          primary: 'hsl(var(--color-primary))',
          'primary-foreground': 'hsl(var(--color-on-primary))',
          accent: 'hsl(var(--color-surface-container-highest))',
          'accent-foreground': 'hsl(var(--color-on-surface))',
          border: 'hsl(var(--color-outline-variant))',
          ring: 'hsl(var(--color-primary))',
        },
      },
    },
  },
}

export default config
