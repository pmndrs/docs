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
    // 'prettier-plugin-tailwindcss', // Temporarily disabled to avoid className reordering
  ],
}

export default config
