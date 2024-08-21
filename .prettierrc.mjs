/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
  plugins: [
    {
      name: 'prettier-plugin-organize-imports',
      organizeImportsSkipDestructiveCodeActions: true,
    },
    'prettier-plugin-tailwindcss', // MUST come last
  ],
}

export default config
