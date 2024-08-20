import type { Config } from 'tailwindcss'
import { withMaterialColors } from 'tailwind-material-colors'

const config: Config = {
  darkMode: 'class',
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/aspect-ratio')],
}

//
// https://tailwind-material-colors-docs.vercel.app/
//
const config2 = withMaterialColors(
  config,
  {
    // Your base colors as HEX values. 'primary' is required.
    primary: '#323e48',
    // secondary and/or tertiary are optional, if not set they will be derived from the primary color.
    // secondary: '#ffff00',
    // tertiary: '#0000ff',

    // Add any named colors you need:
    hint: '#d29922',
    // green: '#00ff00',
    // blue: '#0000ff',
  },
  {
    extend: false,
    scheme: 'tonalSpot', // one of 'content', 'expressive', 'fidelity', 'monochrome', 'neutral', 'tonalSpot' or 'vibrant'
    contrast: 0, // contrast is optional and ranges from -1 (less contrast) to 1 (more contrast).
  },
)

export default config2
