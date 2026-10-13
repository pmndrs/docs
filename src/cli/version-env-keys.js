// The names of the version switcher's `NEXT_PUBLIC_VERSION_*` variables, and nothing else.
//
// Kept separate so `next.config.mts` only loads the version helpers when a variable is missing.
// `./version-env.ts` re-exports the list, typed, and checks
// at compile time that it names every key of `VersionEnv` and nothing more.

export const VERSION_ENV_KEYS = /** @type {const} */ ([
  'NEXT_PUBLIC_VERSION_LABEL',
  'NEXT_PUBLIC_VERSION_BRANCH',
  'NEXT_PUBLIC_VERSION_URL_TEMPLATE',
  'NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH',
  'NEXT_PUBLIC_VERSION_PRODUCTION_URL',
  'NEXT_PUBLIC_VERSION_BRANCHES',
])
