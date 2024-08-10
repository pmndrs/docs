import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/aspect-ratio')],
}
export default config
