// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      'react/jsx-no-target-blank': 0,
      'import/no-anonymous-default-export': 0,
      'react-hooks/set-state-in-effect': 0,
      // `next/image` buys nothing here: `images.unoptimized` is set in next.config.mjs,
      // and the CLI renders these components outside Next, where next/image throws.
      '@next/next/no-img-element': 0,
    },
  },
  ...storybook.configs['flat/recommended'],
]

export default eslintConfig
