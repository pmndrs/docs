/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
  plugins: [
    'prettier-plugin-tailwindcss', // MUST come last
  ],
}

export default config
