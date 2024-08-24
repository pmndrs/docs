/** @type {import("lint-staged").Config} */
const config = {
  '*': ['prettier --ignore-unknown --write'],
}

export default config
