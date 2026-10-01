// The names of the version switcher's `NEXT_PUBLIC_VERSION_*` variables, and nothing else.
//
// Plain JavaScript, on its own, so that `next.config.mjs` can tell whether any is still missing
// before it imports a single `.ts` file: on a Node without type stripping, a build whose variables
// the CLI already set must not even try. `./version-env.ts` re-exports the list, typed, and checks
// at compile time that it names every key of `VersionEnv` and nothing more.

export const VERSION_ENV_KEYS = /** @type {const} */ ([
  'NEXT_PUBLIC_VERSION_LABEL',
  'NEXT_PUBLIC_VERSION_BRANCH',
  'NEXT_PUBLIC_VERSION_URL_TEMPLATE',
  'NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH',
  'NEXT_PUBLIC_VERSION_PRODUCTION_URL',
  'NEXT_PUBLIC_VERSION_BRANCHES',
])
