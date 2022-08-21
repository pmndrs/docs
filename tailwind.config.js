module.exports = {
  mode: 'jit',
  content: ['./src/components/**/*.{js,ts,jsx,tsx}', './src/pages/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/aspect-ratio')],
}
