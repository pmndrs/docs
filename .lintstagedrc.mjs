/** @type {import("lint-staged").Config} */
const config = {
  // --no-error-on-unmatched-pattern: prettier >=3.8 refuses a symlink passed by
  // name (e.g. `.claude/skills/shadcn`) instead of skipping it.
  '*': ['prettier --ignore-unknown --no-error-on-unmatched-pattern --write'],
}

export default config
