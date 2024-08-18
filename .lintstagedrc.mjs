/** @type {import("lint-staged").Config} */
const config = {
  '*': ['prettier --ignore-path .gitignore --ignore-unknown --write'],
}

export default config
