import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      'react/jsx-no-target-blank': 0,
      'import/no-anonymous-default-export': 0,
      'react-hooks/set-state-in-effect': 0,
    },
  },
]

export default eslintConfig
